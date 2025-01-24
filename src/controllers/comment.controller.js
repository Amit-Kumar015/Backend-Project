import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
   
    const { content } = req.body;
    const { videoId } = req.params;

    if(!content || !videoId){
        throw new ApiError(404, "provide both content and videoId")
    }

    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user._id
    })

    if(!comment){
        throw new ApiError(500, "Something went wrong while adding comment in database")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, comment, "Comment added successfully"))
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment

    // take comment from req
    // find comment which need to update from database
    // change the comment

    const { content } = req.body
    const { commentId } = req.params

    // const comment = Comment.findByIdAndUpdate(
    //     commentId,
    //     {
    //         comment: content
    //     }
    // )

    // if(!comment){
    //     throw new ApiError(500, "Something went wrong while updating comment")
    // }

    return res
    .status(200)
    .json(new ApiResponse(200, content, "comment updated successfully"))
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }