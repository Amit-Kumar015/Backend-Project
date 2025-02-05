import mongoose, { isValidObjectId } from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/apiError.js"
import { ApiResponse } from "../utils/apiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Video } from "../models/video.model.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body

    if ([name, description].some(item => item.trim() === "")) {
        throw new ApiError(404, "name and description are required")
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user._id
    })

    if (!playlist) {
        throw new ApiError(500, "error while making playlist")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, playlist, "playlist created successfully")
        )
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params

    if (!userId || !isValidObjectId(userId)) {
        throw new ApiError(400, "provide valid userId")
    }

    const user = await User.findById(userId)

    if(!user){
        throw new ApiError(404, "user not found")
    }

    const playlist = await Playlist.find({owner: userId})

    if(!playlist){
        throw new ApiError(500, "error while fetching playlist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, playlist, "playlist fetched successfully")
    )
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params

    if(!playlistId || !isValidObjectId(playlistId)){
        throw new ApiError(400, "provide valid playlist id")
    }

    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(404, "playlist not found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, playlist, "playlist fetched successfully")
    )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params

    if(!playlistId || !isValidObjectId(playlistId)){
        throw new ApiError(400, "provide valid playlist id")
    }
    
    if(!videoId || !isValidObjectId(videoId)){
        throw new ApiError(400, "provide valid video id")
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404, "video not found")
    }

    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(404, "playlist not found")
    }

    if(!playlist.owner != req.user._id){
        throw new ApiError(401, "Unauthorized request")
    }

    if(playlist.video.includes(videoId)){
        throw new ApiError(405, "video already present")
    }

    const updated = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $addToSet: {
                videos: videoId
            }
        },
        {
            new: true
        }
    )

    if(!updated){
        throw new ApiError(500, "error while adding video to playlist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, updated, "video added to playlist successfully")
    )    
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params

    if(!playlistId || !isValidObjectId(playlistId)){
        throw new ApiError(400, "provide valid playlist id")
    }
    
    if(!videoId || !isValidObjectId(videoId)){
        throw new ApiError(400, "provide valid video id")
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404, "video not found")
    }

    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(404, "playlist not found")
    }

    if(!playlist.owner != req.user._id){
        throw new ApiError(401, "Unauthorized request")
    }

    const removed = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull: {
                videos: {
                    $in: [`${videoId}`]
                }
            }
        },
        {
            new: true
        }
    )

    if(!removed){
        throw new ApiError(500, "error while removing video from playlist")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, removed, "video removed from playlist successfully")
    )
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params

    if (!playlistId || !isValidObjectId(playlistId)) {
        throw new ApiError(404, "provide valid playlist id")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(404, "playlist not found")
    }

    if (!playlist.owner.toString().equals(req.user._id.toString())) {
        throw new ApiError(401, "Unauthorized request")
    }

    const deleted = await playlist.deleteOne()

    if (!deleted) {
        throw new ApiError(500, "error while deleting playlist")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, deleted, "playlist deleted successfully")
        )
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body

    if (!playlistId || !isValidObjectId(playlistId)) {
        throw new ApiError(400, "provide valid playlist Id")
    }

    if (!name?.trim() || !description?.trim()) {
        throw new ApiError(404, "provide atleast name or description")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(404, "playlist not found")
    }

    if (!playlist.owner.toString().equals(req.user._id.toString())) {
        throw new ApiError(401, "Unauthorized request")
    }

    const updated = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set: {
                name: name || playlist?.name,
                description: description || playlist?.description
            }
        },
        {
            new: true
        }
    )

    if (!updated) {
        throw new ApiError(500, "error while updating playlist")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, updated, "playlist updated successfully")
        )
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}