ALTER TABLE `Movie` CHANGE `PosterURL` `image_key` varchar(255) NOT NULL;
--> statement-breakpoint
ALTER TABLE `Snack` CHANGE `imageURL` `image_key` varchar(255) NOT NULL;
--> statement-breakpoint
UPDATE `Movie` SET `image_key` = CONCAT('movies/', SUBSTRING_INDEX(`image_key`, '/', -1)) WHERE `image_key` LIKE '%/api/assets/images/movies/%';
--> statement-breakpoint
UPDATE `Snack` SET `image_key` = CONCAT('snacks/', SUBSTRING_INDEX(`image_key`, '/', -1)) WHERE `image_key` LIKE '%/api/assets/images/snacks/%';
