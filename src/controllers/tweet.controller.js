import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {

    const {content} = req.body

    if(!content){
        throw new ApiError(404, "Tweet content is required")
    }

    const tweet = await Tweet.create({
        content,
        owner: req.user._id
    })

    if(!tweet){
        throw new ApiError(500, "Error while creating tweet")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, content, "Tweet created successfully")
    )
})

const getUserTweets = asyncHandler(async (req, res) => {

    const { userId } = req.params

    if(!userId || !isValidObjectId(userId)){
        throw new ApiError(404, "provide valid user id")
    }

    const userTweets = await Tweet.aggregate([
        {
            $match: {owner: userId}
        },
        {
            $lookup: {
                from: "users",
                foreignField: "_id",
                localField: "owner",
                as: "tweetsdocument"
            }
        },
        {
            $unwind: "$tweetsdocument"
        },
        {
            $project: {
                content: 1,
                owner: "$tweetsdocument"
            }
        }
    ])

    if(!userTweets.length){
        throw new ApiError(404, "No tweets found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, userTweets, "tweets fetched successfully")
    )    
})

const updateTweet = asyncHandler(async (req, res) => {

    const {tweetId} = req.params
    const {content} = req.body

    if(!tweetId || !isValidObjectId(tweetId)){
        throw new ApiError(404, "provide valid tweet id")
    }

    if(!content){
        throw new ApiError(404, "provide proper description")
    }

    const tweet = await Tweet.findById(tweetId)

    if(!tweet){
        throw new ApiError(404, "tweet does not exist")
    }

    if(!tweet.owner.toString().equals(req.user._id.toString())){
        throw new ApiError(401, "Unauthorized request")
    }

    const newTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        {
            $set: {content}
        },
        {
            new: true
        }
    )

    if(!newTweet){
        throw new ApiError(500, "Error while updating tweet")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, content, "tweet updated successfully")
    )
})

const deleteTweet = asyncHandler(async (req, res) => {

    const { tweetId } = req.params

    if(!tweetId || !isValidObjectId(tweetId)){
        throw new ApiError(400, "provide valid tweet id")
    }

    const tweet = await Tweet.findById(tweetId)

    if(!tweet){
        throw new ApiError(404, "tweet does not exist")
    }

    if(!tweet.owner.toString().equals(req.user._id.toString())){
        throw new ApiError(401, "Unauthorized request")
    }

    const deleteTweet = await tweet.delete()

    if(!deleteTweet){
        throw new ApiError(500, "Error while deleting tweet")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "deleted tweet successfully")
    )
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}