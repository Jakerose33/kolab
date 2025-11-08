-- Update the image URLs to use the correct public path
UPDATE public.events SET image_url = 'images/events/midnight-jazz.jpg' WHERE title = 'Midnight Jazz at The Underground';
UPDATE public.events SET image_url = 'images/events/street-art-opening.jpg' WHERE title = 'Street Art Gallery Opening';  
UPDATE public.events SET image_url = 'images/events/underground-market.jpg' WHERE title = 'Underground Market Night';
UPDATE public.events SET image_url = 'images/events/warehouse-rave.jpg' WHERE title = 'Warehouse Rave: Electronic Nights';