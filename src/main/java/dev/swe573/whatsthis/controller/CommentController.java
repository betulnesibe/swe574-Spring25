package dev.swe573.whatsthis.controller;

import dev.swe573.whatsthis.dto.CommentDto;
import dev.swe573.whatsthis.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.hateoas.CollectionModel;
import org.springframework.hateoas.EntityModel;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;



import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    @Autowired
    private CommentService commentService;

    //Create new comment
    @PostMapping
    public EntityModel<CommentDto> newComment(@RequestBody CommentDto commentDto) {
        System.out.println("Received CommentDto: " + commentDto);

        CommentDto createdComment = commentService.newComment(commentDto);

        return EntityModel.of(createdComment,
                linkTo(methodOn(CommentController.class).getCommentsById(createdComment.getId())).withSelfRel(),
                linkTo(methodOn(PostController.class).one(createdComment.getPostId())).withRel("post"));
    }

    @GetMapping("/{id}")
    public EntityModel<CommentDto> getCommentsById(@PathVariable Long id) {
        CommentDto commentDto = commentService.getCommentById(id);

        return EntityModel.of(commentDto,
                linkTo(methodOn(CommentController.class).getCommentsById(commentDto.getId())).withSelfRel(),
                linkTo(methodOn(PostController.class).one(commentDto.getPostId())).withRel("post"));
    }

    @GetMapping("/posts/{postId}/comments")
    public CollectionModel<EntityModel<CommentDto>> getCommentsByPost(@PathVariable Long postId) {
        List<CommentDto> comments = commentService.getCommentsByPostId(postId);

        List<EntityModel<CommentDto>> commentModels = comments.stream()
                .map(commentDto -> EntityModel.of(commentDto,
                        linkTo(methodOn(CommentController.class).getCommentsById(commentDto.getId())).withSelfRel(),
                        linkTo(methodOn(PostController.class).one(postId)).withRel("post")))
        .collect(Collectors.toList());

        return CollectionModel.of(commentModels,
                linkTo(methodOn(CommentController.class).getCommentsByPost(postId)).withSelfRel());

    }

    @DeleteMapping("/{id}")
    public void deleteComment(@PathVariable Long id) {
        commentService.deleteComment(id);
    }

    @PostMapping("/{id}/upvote")
    public EntityModel<CommentDto> upvoteComment(
            @PathVariable Long id,
            @RequestParam(required = false) Long userId) {
        
        System.out.println("Upvoting comment " + id + " for user " + userId);
        CommentDto updatedComment = commentService.upvoteComment(id, userId);

        return EntityModel.of(updatedComment,
                linkTo(methodOn(CommentController.class).getCommentsById(id)).withSelfRel(),
                linkTo(methodOn(PostController.class).one(updatedComment.getPostId())).withRel("post"));
    }

    @PostMapping("/{id}/downvote")
    public EntityModel<CommentDto> downvoteComment(
            @PathVariable Long id,
            @RequestParam(required = false) Long userId) {
        
        System.out.println("Downvoting comment " + id + " for user " + userId);
        CommentDto updatedComment = commentService.downvoteComment(id, userId);

        return EntityModel.of(updatedComment,
                linkTo(methodOn(CommentController.class).getCommentsById(id)).withSelfRel(),
                linkTo(methodOn(PostController.class).one(updatedComment.getPostId())).withRel("post"));
    }

    @GetMapping("/user/{userId}")
    public List<CommentDto> getCommentsByUser(@PathVariable Long userId) {
        return commentService.getCommentsByUserId(userId);
    }





}
