package dev.swe573.whatsthis.repository;

import dev.swe573.whatsthis.model.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PostRepo extends JpaRepository<Post, Long> {
    List<Post> findByUserId(Long userId);

    Page<Post> findAllByOrderByCreatedAtDesc(Pageable pageable);
    Page<Post> findAllByOrderByVotesDesc(Pageable pageable);
    Page<Post> findAllByIsSolvedTrue(Pageable pageable);
    Page<Post> findAllByIsSolvedFalse(Pageable pageable);

    @Query("SELECT DISTINCT p FROM Post p WHERE " +
           "LOWER(p.title) LIKE LOWER(CONCAT('%', :searchText, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :searchText, '%'))")
    List<Post> findByTitleOrDescriptionContaining(@Param("searchText") String searchText);

    @Query("SELECT DISTINCT p FROM Post p WHERE " +
           "(LOWER(p.title) LIKE LOWER(CONCAT('%', :searchText, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :searchText, '%'))) AND " +
           "(:material IS NULL OR p.material = :material) AND " +
           "(:color IS NULL OR p.color = :color) AND " +
           "(:shape IS NULL OR p.shape = :shape) AND " +
           "(:pattern IS NULL OR p.pattern = :pattern) AND " +
           "(:timePeriod IS NULL OR p.timePeriod = :timePeriod) AND " +
           "(:hardness IS NULL OR p.hardness = :hardness) AND " +
           "(:functionality IS NULL OR p.functionality = :functionality) AND " +
           "(:handmade IS NULL OR p.handmade = :handmade)")
    List<Post> searchPostsWithFilters(
        @Param("searchText") String searchText,
        @Param("material") String material,
        @Param("color") String color,
        @Param("shape") String shape,
        @Param("pattern") String pattern,
        @Param("timePeriod") String timePeriod,
        @Param("hardness") String hardness,
        @Param("functionality") String functionality,
        @Param("handmade") Boolean handmade
    );
}
