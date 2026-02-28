## v1.0.0

# My Animal Book
My Animal Book is a web app that allows users to see endangered animals in their area and keep a virtual journal of their animal observations.

My Animal Book uses a user auth system to allow users to sign up and log in. When a user logs in, they can see a list of critically endangered to near threatened animals (status according to IUCNRedList) observed in their city or town. Clicking on an endangered animal shows the user some images of the animal, information about the animal, and most importantly, a list of threats to the species and conservation actions the user can take to protect it.

The user can add entries by navigating to their animal book and clicking "Add Entry". The image the user uploads is sent to a backend that detects which animal is in the photo. The user can see the animal's common/scientific name, information about it, and threats to the species. They can add other information to their entry, such as where they found the animal and some notes about their observation, and then add the entry to their journal. The Animal Book page shows the user all their journal entries sorted by most to least recent.

## Tech Stack
Frontend/backend: Sveltekit
User Auth:
- MongoDB
- bcrypt
Geocoding/reverse geocoding: Geoapify
Fetching information:
- IUCN Red List API
- GBIF
- Mediawiki
Image detection: AnimalDetect API
Image fetching: INaturalist API
Generating conservation actions: OpenRouter
Frontend Design:
- CSS
- Tailwind
- GSAP

## Demo/installation
Demo link can be found [here](https://my-animal-book.vercel.app/)
To install locally, clone the repo, change the directory to biodiversity-app, then install dependencies and run ```npm run dev```. Make sure to create an .env file for all the secret values in this project! There are a lot!
