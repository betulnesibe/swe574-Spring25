package dev.swe573.whatsthis.controller;

import dev.swe573.whatsthis.dto.CommentDto;
import dev.swe573.whatsthis.dto.PostDto;
import dev.swe573.whatsthis.dto.TagDto;
import dev.swe573.whatsthis.service.CommentService;
import dev.swe573.whatsthis.service.PostService;
import dev.swe573.whatsthis.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.hateoas.CollectionModel;
import org.springframework.hateoas.EntityModel;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private PostService postService;
    private UserService userService;
    private CommentService commentService;

    @Autowired
    public PostController(PostService postService, UserService userService) {
        this.postService = postService;
        this.userService = userService;
    }

    //Get all posts
    @GetMapping
    public Page<PostDto> all() {
        return postService.getPaginatedPosts(PageRequest.of(0, 12, Sort.by(Sort.Direction.DESC, "createdAt")));
    }

    //Get a post by id
    @GetMapping("/{id}")
    public EntityModel<PostDto> one(@PathVariable Long id) {
        PostDto postDto = postService.one(id);
        EntityModel<PostDto> postModel = EntityModel.of(postDto,
                linkTo(methodOn(PostController.class).one(id)).withSelfRel(),
                linkTo(methodOn(PostController.class).all()).withRel("all-posts"),
                linkTo(methodOn(PostController.class).getCommentsByPost(id)).withRel("comments"));

        return postModel;
    }

    //Create new post
    @PostMapping
    public EntityModel<PostDto> newPost(@RequestBody PostDto postDto) {
        PostDto createdPost = postService.newPost(postDto);
        return EntityModel.of(createdPost,
                linkTo(methodOn(PostController.class).one(createdPost.getId())).withSelfRel(),
                linkTo(methodOn(PostController.class).all()).withRel("all-posts"));
    }

    //Update existing post
    @PutMapping("/{id}")
    public EntityModel<PostDto> updatePost (@PathVariable Long id, @RequestBody PostDto postDto) {
        postDto.setId(id);

        PostDto updatedPost = postService.updatePost(postDto);

        return EntityModel.of(updatedPost,
                linkTo(methodOn(PostController.class).one(id)).withSelfRel(),
                linkTo(methodOn(PostController.class).all()).withRel("all-posts"));
    }

    @GetMapping("/{postId}/comments")
    public CollectionModel<EntityModel<CommentDto>> getCommentsByPost(@PathVariable Long postId) {
        List<CommentDto> comments = commentService.getCommentsByPostId(postId);
        List<EntityModel<CommentDto>> commentModels = comments.stream()
                .map(commentDTO -> EntityModel.of(commentDTO,
                        linkTo(methodOn(PostController.class).getCommentsByPost(postId)).withRel("post-comments"),
                        linkTo(methodOn(PostController.class).one(postId)).withRel("post")))
                .collect(Collectors.toList());

        return CollectionModel.of(commentModels, linkTo(methodOn(PostController.class).getCommentsByPost(postId)).withSelfRel());
    }

    @GetMapping("/tags")
    public List<TagDto> getTagSuggestions(@RequestParam String query) {
        return postService.getTagSuggestions(query);
    }

    @PostMapping("/{id}/upvote")
    public ResponseEntity<PostDto> upvotePost(@PathVariable Long id, @RequestBody Map<String, Long> payload) {
        Long userId = payload.get("userId");
        try {
            PostDto updatedPost = postService.handleVote(id, userId, "upvote");
            return ResponseEntity.ok(updatedPost);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{id}/downvote")
    public ResponseEntity<PostDto> downvotePost(@PathVariable Long id, @RequestBody Map<String, Long> payload) {
        Long userId = payload.get("userId");
        try {
            PostDto updatedPost = postService.handleVote(id, userId, "downvote");
            return ResponseEntity.ok(updatedPost);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/user/{userId}")
    public CollectionModel<EntityModel<PostDto>> getPostsByUserId(@PathVariable Long userId) {
        List<PostDto> userPosts = postService.getPostsByUserId(userId);
        List<EntityModel<PostDto>> postModels = userPosts.stream()
                .map(postDto -> EntityModel.of(postDto,
                        linkTo(methodOn(PostController.class).one(postDto.getId())).withSelfRel(),
                        linkTo(methodOn(PostController.class).all()).withRel("all-posts")))
                .collect(Collectors.toList());

        return CollectionModel.of(postModels,
                linkTo(methodOn(PostController.class).getPostsByUserId(userId)).withSelfRel());
    }

    @PostMapping("/{postId}/solution/{commentId}")
    public ResponseEntity<?> markAsSolution(@PathVariable Long postId, @PathVariable Long commentId) {
        try {
            PostDto updatedPost = postService.markAsSolution(postId, commentId);
            return ResponseEntity.ok(updatedPost);
        } catch (UnauthorizedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You are not authorized to mark solution for this post");
        } catch (PostNotFoundException | CommentNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/{postId}/vote/{userId}")
    public ResponseEntity<Map<String, String>> getUserVote(
        @PathVariable Long postId,
        @PathVariable Long userId
    ) {
        String voteType = postService.getUserVote(postId, userId);
        return ResponseEntity.ok(Map.of("voteType", voteType != null ? voteType : ""));
    }

    @GetMapping("/search")
    public ResponseEntity<List<PostDto>> searchPosts(@RequestParam Map<String, String> searchParams) {
        List<PostDto> results = postService.searchPosts(searchParams);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/paginated")
    public Page<PostDto> getPaginatedPosts(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "12") int size,
        @RequestParam(defaultValue = "newest") String sort
    ) {
        PageRequest pageRequest = PageRequest.of(page, size);
        
        switch (sort) {
            case "mostVoted":
                return postService.findAllByOrderByVotesDesc(pageRequest);
            case "solved":
                return postService.findAllByIsSolvedTrue(pageRequest);
            case "unsolved":
                return postService.findAllByIsSolvedFalse(pageRequest);
            case "newest":
            default:
                return postService.findAllByOrderByCreatedAtDesc(pageRequest);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePost(@PathVariable Long id) {
        try {
            postService.deletePost(id);
            return ResponseEntity.ok().build();
        } catch (PostNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (UnauthorizedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You are not authorized to delete this post");
        }
    }
}
