package dev.swe573.whatsthis.service;

import dev.swe573.whatsthis.controller.CommentNotFoundException;
import dev.swe573.whatsthis.controller.PostNotFoundException;
import dev.swe573.whatsthis.controller.UserNotFoundException;
import dev.swe573.whatsthis.dto.PartDto;
import dev.swe573.whatsthis.dto.PostDto;
import dev.swe573.whatsthis.dto.TagDto;
import dev.swe573.whatsthis.model.Part;
import dev.swe573.whatsthis.model.Post;
import dev.swe573.whatsthis.model.User;
import dev.swe573.whatsthis.model.Comment;
import dev.swe573.whatsthis.repository.CommentRepo;
import dev.swe573.whatsthis.repository.PostRepo;
import dev.swe573.whatsthis.repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Stream;

@Service
public class PostService {

    @Autowired
    private PostRepo postRepo;
    @Autowired
    private UserService userService;
    @Autowired
    private CommentService commentService;

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private CommentRepo commentRepo;

    @Autowired
    public PostService(PostRepo postRepo) {
        this.postRepo = postRepo;

    }

    @Autowired
    private TagService tagService;

    public List<PostDto> all() {
        return postRepo.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PostDto one(Long id) {
        Post post =  postRepo.findById(id).orElseThrow(() -> new PostNotFoundException(id));
        return toDto(post);
    }

    @Transactional
    public PostDto newPost(PostDto postDto) {
        Post post = toEntity(postDto);
        post.setCreatedAt(LocalDateTime.now());
        Post savedPost = postRepo.save(post);
        return toDto(savedPost);
    }

    private Post toEntity(PostDto postDto) {
        Post post = new Post();
        post.setTitle(postDto.getTitle());
        post.setDescription(postDto.getDescription());
        post.setVotes(postDto.getVotes());
        post.setImageUrls(postDto.getImageUrls() != null ? postDto.getImageUrls() : new ArrayList<>());

        if (postDto.getUserId() == null) {
            throw new IllegalArgumentException("User ID must not be null.");
        }
        post.setUserId(postDto.getUserId());

        //optional
        post.setMaterial(postDto.getMaterial());
        post.setSize(postDto.getSize());
        post.setColor(postDto.getColor());
        post.setShape(postDto.getShape());
        post.setWeight(postDto.getWeight());
        post.setTextAndLanguage(postDto.getTextAndLanguage());
        post.setSmell(postDto.getSmell());
        post.setTaste(postDto.getTaste());
        post.setTexture(postDto.getTexture());
        post.setHardness(postDto.getHardness());
        post.setPattern(postDto.getPattern());
        post.setBrand(postDto.getBrand());
        post.setPrint(postDto.getPrint());
        post.setLocation(postDto.getLocation());
        post.setTimePeriod(postDto.getTimePeriod());
        post.setHandmade(postDto.getHandmade());
        post.setFunctionality(postDto.getFunctionality());
        post.setHeightValue(postDto.getHeightValue());
        post.setHeightUnit(postDto.getHeightUnit());
        post.setDepthValue(postDto.getDepthValue());
        post.setDepthUnit(postDto.getDepthUnit());
        post.setWidthValue(postDto.getWidthValue());
        post.setWidthUnit(postDto.getWidthUnit());

        post.setCreatedAt(postDto.getCreatedAt());

        post.setTags(postDto.getTags() != null ? postDto.getTags() : new ArrayList<>());


//        post.setComments(new ArrayList<>());

        System.out.println("Incoming parts data: " + postDto.getParts());

        if (postDto.getParts() != null && !postDto.getParts().isEmpty()) {
            List<Part> parts = postDto.getParts().stream()
                .map(partDto -> {
                    Part part = new Part();
                    part.setPartName(partDto.getPartName());
                    part.setMaterial(partDto.getMaterial());
                    part.setSize(partDto.getSize());
                    part.setTextAndLanguage(partDto.getTextAndLanguage());
                    part.setColor(partDto.getColor());
                    part.setShape(partDto.getShape());
                    part.setWeight(partDto.getWeight());
                    part.setPrice(partDto.getPrice());
                    part.setLocation(partDto.getLocation());
                    part.setTimePeriod(partDto.getTimePeriod());
                    part.setSmell(partDto.getSmell());
                    part.setTaste(partDto.getTaste());
                    part.setTexture(partDto.getTexture());
                    part.setHardness(partDto.getHardness());
                    part.setPattern(partDto.getPattern());
                    part.setBrand(partDto.getBrand());
                    part.setPrint(partDto.getPrint());
                    part.setIcons(partDto.getIcons());
                    part.setHandmade(partDto.getHandmade());
                    part.setFunctionality(partDto.getFunctionality());
                    part.setHeightValue(partDto.getHeightValue());
                    part.setHeightUnit(partDto.getHeightUnit());
                    part.setDepthValue(partDto.getDepthValue());
                    part.setDepthUnit(partDto.getDepthUnit());
                    part.setWidthValue(partDto.getWidthValue());
                    part.setWidthUnit(partDto.getWidthUnit());
                    return part;
                })
                .collect(Collectors.toList());
            post.setParts(parts);
        } else {
            post.setParts(new ArrayList<>());
        }

        return post;
    }

    private PostDto toDto(Post post) {
        PostDto postDto = new PostDto();

        postDto.setId(post.getId());
        postDto.setTitle(post.getTitle());
        postDto.setDescription(post.getDescription());
        postDto.setVotes(post.getVotes());
        postDto.setUserId(post.getUserId());

        postDto.setImageUrls(
                post.getImageUrls().stream()
                        .map(fileName -> "/uploads/" + fileName)
                        .collect(Collectors.toList())
        );

        postDto.setMaterial(post.getMaterial());
        postDto.setSize(post.getSize());
        postDto.setColor(post.getColor());
        postDto.setShape(post.getShape());
        postDto.setWeight(post.getWeight());
        postDto.setTextAndLanguage(post.getTextAndLanguage());
        postDto.setSmell(post.getSmell());
        postDto.setTaste(post.getTaste());
        postDto.setTexture(post.getTexture());
        postDto.setHardness(post.getHardness());
        postDto.setPattern(post.getPattern());
        postDto.setBrand(post.getBrand());
        postDto.setPrint(post.getPrint());
        postDto.setLocation(post.getLocation());
        postDto.setTimePeriod(post.getTimePeriod());
        postDto.setHandmade(post.getHandmade());
        postDto.setFunctionality(post.getFunctionality());
        postDto.setHeightValue(post.getHeightValue());
        postDto.setHeightUnit(post.getHeightUnit());
        postDto.setDepthValue(post.getDepthValue());
        postDto.setDepthUnit(post.getDepthUnit());
        postDto.setWidthValue(post.getWidthValue());
        postDto.setWidthUnit(post.getWidthUnit());

        postDto.setComments(new ArrayList<>());
        postDto.setCreatedAt(post.getCreatedAt());

        postDto.setTags(post.getTags() != null ? post.getTags() : new ArrayList<>());

        System.out.println("Converting parts to DTO: " + post.getParts());

        if (post.getParts() != null && !post.getParts().isEmpty()) {
            List<PartDto> partDtos = post.getParts().stream()
                .map(part -> {
                    PartDto partDto = new PartDto();
                    partDto.setPartName(part.getPartName());
                    partDto.setMaterial(part.getMaterial());
                    partDto.setSize(part.getSize());
                    partDto.setTextAndLanguage(part.getTextAndLanguage());
                    partDto.setColor(part.getColor());
                    partDto.setShape(part.getShape());
                    partDto.setWeight(part.getWeight());
                    partDto.setPrice(part.getPrice());
                    partDto.setLocation(part.getLocation());
                    partDto.setTimePeriod(part.getTimePeriod());
                    partDto.setSmell(part.getSmell());
                    partDto.setTaste(part.getTaste());
                    partDto.setTexture(part.getTexture());
                    partDto.setHardness(part.getHardness());
                    partDto.setPattern(part.getPattern());
                    partDto.setBrand(part.getBrand());
                    partDto.setPrint(part.getPrint());
                    partDto.setIcons(part.getIcons());
                    partDto.setHandmade(part.getHandmade());
                    partDto.setFunctionality(part.getFunctionality());
                    partDto.setHeightValue(part.getHeightValue());
                    partDto.setHeightUnit(part.getHeightUnit());
                    partDto.setDepthValue(part.getDepthValue());
                    partDto.setDepthUnit(part.getDepthUnit());
                    partDto.setWidthValue(part.getWidthValue());
                    partDto.setWidthUnit(part.getWidthUnit());
                    return partDto;
                })
                .collect(Collectors.toList());
            postDto.setParts(partDtos);
        } else {
            postDto.setParts(new ArrayList<>());
        }

        postDto.setSolutionCommentId(post.getSolutionCommentId());
        postDto.setSolved(post.isSolved());
        postDto.setCreatedAt(post.getCreatedAt());

        return postDto;
    }

    public List<TagDto> getTagSuggestions(String query) {
        return tagService.searchTags(query);
    }

    public PostDto updatePost(PostDto postDto) {
        Post existingPost = postRepo.findById(postDto.getId())
                .orElseThrow(() -> new PostNotFoundException(postDto.getId()));

        existingPost.setTitle(postDto.getTitle());
        existingPost.setDescription(postDto.getDescription());
        existingPost.setImageUrls(postDto.getImageUrls());
        existingPost.setTags(postDto.getTags());

        existingPost.setMaterial(postDto.getMaterial());
        existingPost.setSize(postDto.getSize());
        existingPost.setColor(postDto.getColor());
        existingPost.setShape(postDto.getShape());
        existingPost.setWeight(postDto.getWeight());
        existingPost.setTextAndLanguage(postDto.getTextAndLanguage());
        existingPost.setSmell(postDto.getSmell());
        existingPost.setTaste(postDto.getTaste());
        existingPost.setTexture(postDto.getTexture());
        existingPost.setHardness(postDto.getHardness());
        existingPost.setPattern(postDto.getPattern());
        existingPost.setBrand(postDto.getBrand());
        existingPost.setPrint(postDto.getPrint());
        existingPost.setLocation(postDto.getLocation());
        existingPost.setTimePeriod(postDto.getTimePeriod());
        existingPost.setHandmade(postDto.getHandmade());
        existingPost.setFunctionality(postDto.getFunctionality());
        existingPost.setPrice(postDto.getPrice());
        existingPost.setHeightValue(postDto.getHeightValue());
        existingPost.setHeightUnit(postDto.getHeightUnit());
        existingPost.setDepthValue(postDto.getDepthValue());
        existingPost.setDepthUnit(postDto.getDepthUnit());
        existingPost.setWidthValue(postDto.getWidthValue());
        existingPost.setWidthUnit(postDto.getWidthUnit());
        existingPost.setCreatedAt(postDto.getCreatedAt());

        existingPost = postRepo.save(existingPost);
        return toDto(existingPost);
    }

    public void upvotePost(Long id) {
        postRepo.findById(id).ifPresent(post -> {
            post.setVotes(post.getVotes() + 1);
            postRepo.save(post);
        });
    }

    public void downvotePost(Long id) {
        postRepo.findById(id).ifPresent(post -> {
            post.setVotes(post.getVotes() + 1);
            postRepo.save(post);
        });
    }

    public List<PostDto> getPostsByUserId(Long userId) {
        return postRepo.findByUserId(userId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public PostDto markAsSolution(Long postId, Long commentId) {
        Post post = postRepo.findById(postId)
                .orElseThrow(() -> new PostNotFoundException(postId));
        Comment comment = commentRepo.findById(commentId)
                .orElseThrow(() -> new CommentNotFoundException(commentId));


        if (!comment.getPostId().equals(postId)) {
            throw new IllegalArgumentException("Comment does not belong to this post");
        }

        post.setSolutionCommentId(commentId);
        post.setSolved(true);
        
        Post updatedPost = postRepo.save(post);
        return toDto(updatedPost);
    }

    @Transactional
    public PostDto handleVote(Long postId, Long userId, String voteType) {
        Post post = postRepo.findById(postId)
                .orElseThrow(() -> new PostNotFoundException(postId));


        String currentVote = getUserVote(postId, userId);
        
        if (currentVote != null) {
            if (currentVote.equals(voteType)) {
                post.setVotes(post.getVotes() + (voteType.equals("upvote") ? -1 : 1));
                removeUserVote(postId, userId);
            } else {
                post.setVotes(post.getVotes() + (voteType.equals("upvote") ? 2 : -2));
                updateUserVote(postId, userId, voteType);
            }
        } else {
            post.setVotes(post.getVotes() + (voteType.equals("upvote") ? 1 : -1));
            saveUserVote(postId, userId, voteType);
        }

        return toDto(postRepo.save(post));
    }

    public String getUserVote(Long postId, Long userId) {
        String key = postId + "-" + userId;
        return userVotes.get(key);
    }

    private void saveUserVote(Long postId, Long userId, String voteType) {
        String key = postId + "-" + userId;
        userVotes.put(key, voteType);
    }

    private void updateUserVote(Long postId, Long userId, String voteType) {
        saveUserVote(postId, userId, voteType);
    }

    private void removeUserVote(Long postId, Long userId) {
        String key = postId + "-" + userId;
        userVotes.remove(key);
    }

    // ????
    private static final Map<String, String> userVotes = new ConcurrentHashMap<>();

    public List<PostDto> searchPosts(Map<String, String> searchParams) {
        String searchText = searchParams.get("query") != null ? searchParams.get("query").trim() : "";
        
        // Check if we have any filters
        boolean hasFilters = searchParams.entrySet().stream()
            .anyMatch(entry -> !entry.getKey().equals("query") && 
                              entry.getValue() != null && 
                              !entry.getValue().trim().isEmpty() &&
                              !entry.getValue().equals("false"));

        List<Post> searchResults;
        
        if (!hasFilters) {
            searchResults = searchText.isEmpty() 
                ? postRepo.findAll() 
                : postRepo.findByTitleOrDescriptionContaining(searchText);
        } else {
            String material = searchParams.get("material");
            String color = searchParams.get("color");
            String shape = searchParams.get("shape");
            String pattern = searchParams.get("pattern");
            String timePeriod = searchParams.get("timePeriod");
            String hardness = searchParams.get("hardness");
            String functionality = searchParams.get("functionality");
            Boolean handmade = searchParams.containsKey("handmade") ? 
                Boolean.valueOf(searchParams.get("handmade")) : null;

            // Convert empty strings to null for the filters!!!
            material = (material != null && material.trim().isEmpty()) ? null : material;
            color = (color != null && color.trim().isEmpty()) ? null : color;
            shape = (shape != null && shape.trim().isEmpty()) ? null : shape;
            pattern = (pattern != null && pattern.trim().isEmpty()) ? null : pattern;
            timePeriod = (timePeriod != null && timePeriod.trim().isEmpty()) ? null : timePeriod;
            hardness = (hardness != null && hardness.trim().isEmpty()) ? null : hardness;
            functionality = (functionality != null && functionality.trim().isEmpty()) ? null : functionality;

            searchResults = postRepo.searchPostsWithFilters(
                searchText, material, color, shape, pattern, 
                timePeriod, hardness, functionality, handmade
            );
        }

        return searchResults.stream()
            .map(this::toDto)
            .collect(Collectors.toList());
    }

    public Page<PostDto> getPaginatedPosts(Pageable pageable) {
        return postRepo.findAll(pageable).map(this::toDto);
    }

    public Page<PostDto> findAllByOrderByVotesDesc(Pageable pageable) {
        return postRepo.findAllByOrderByVotesDesc(pageable).map(this::toDto);
    }

    public Page<PostDto> findAllByIsSolvedTrue(Pageable pageable) {
        return postRepo.findAllByIsSolvedTrue(pageable).map(this::toDto);
    }

    public Page<PostDto> findAllByIsSolvedFalse(Pageable pageable) {
        return postRepo.findAllByIsSolvedFalse(pageable).map(this::toDto);
    }

    public Page<PostDto> findAllByOrderByCreatedAtDesc(Pageable pageable) {
        return postRepo.findAllByOrderByCreatedAtDesc(pageable).map(this::toDto);
    }

    @Transactional
    public void deletePost(Long id) {
        Post post = postRepo.findById(id)
                .orElseThrow(() -> new PostNotFoundException(id));
                
        // Delete all comments associated with the post
        commentRepo.deleteByPostId(id);
        
        // Delete the post
        postRepo.delete(post);
    }
}
