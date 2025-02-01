import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {

    const info = await Video.aggregate([
        {
            $match: {owner: req.user._id}
        },
        {
            $lookup: {
                from: "likes",
                foreignField: "video",
                localField: "_id",
                as: "liked"
            }
        },
        {
            $addFields: {
                likes: {
                    $size: "$liked"
                },
                owner: req.user._id
            }
        },
        {
            $group: {
                _id: null,
                totalLikesCount: {
                    $sum: "$likes"
                },
                totalViewsCount: {
                    $sum: "$views"
                }
            }
        }
    ])

    const subscriber = await Subscription.aggregate([
        {
            $match: {channel: req.user._id}
        },
        {
            $group: {
                _id: null,
                subscriber: {
                    $sum: 1
                }
            }
        }
    ])

    if(!subscriber || !info){
        throw new ApiError(500, "Error while fetching channel data")
    }

    const response = {
        subscribers:subscriber[0]?.subscribers || 0,
        likes:info[0]?.totalLikesCount || 0,
        views:info[0]?.totalViewsCount || 0
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, response, "channel details fetched successfully")
    )
})

const getChannelVideos = asyncHandler(async (req, res) => {

    const videos = await Video.aggregate([
        {
            $match: {
                owner: mongoose.Types.ObjectId(req.user._id),
                isPublished: true
            }
        }
    ])

    if(videos.length == 0){
        throw new ApiError(404, "No videos found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, videos, "All channel videos fetched successfully")
    )
})

export {
    getChannelStats, 
    getChannelVideos
    }