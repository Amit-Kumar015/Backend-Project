import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { Comment } from "../models/comment.model.js"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    // TODO: get video, upload to cloudinary, create video
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if(!videoId || !isValidObjectId(videoId)){
        throw new ApiError(400, "provide valid video id")
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404, "video not found")
    }

    if(!video.owner.toString().equals(req.user._id.toString())){
        throw new ApiError(401, "Unauthorized request")
    }

    const deletedVideo = await video.deleteOne()

    if(!deletedVideo){
        throw new ApiError(500, "error while deleting video")
    }

    await Like.deleteMany({video: videoId})

    await Comment.deleteMany({video: videoId})

    await User.updateMany({watchHistory: videoId}, {$pull: {watchHistory: videoId}})

    return res
    .status(200)
    .json(
        new ApiResponse(200, deletedVideo, "video deleted successfully")
    )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!videoId || !isValidObjectId(videoId)) {
        throw new ApiError(404, "provide valid video Id")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "video not found")
    }

    if (!video.owner.toString().equals(req.user._id.toString())) {
        throw new ApiError(401, "Unauthorized request")
    }

    const toggleStatus = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                isPublished: !isPublished
            }
        },
        {
            new: true
        }
    )

    if (!toggleStatus) {
        throw new ApiError(500, "error while toggling status")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, toggleStatus, "status toggled successfully")
        )
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}