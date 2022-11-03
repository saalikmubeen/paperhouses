# paperHouses
Airbnb like web app. | Rent out your property, house and apartment and earn money.
Book Top Rated Rentals for Your Next Trip. Helping you make the best decisions in renting and choosing your last minute locations.

# [Demo](https://paperhouses.netlify.app/)

# Libraries used

- **`React`** the love of my life
- **`GraphQL`** because REST APIS are boring
- **`apollo-server-express`** as server
- **`MongoDB`** for persistance of data
- **`GraphQL Subscriptions`** for realtime communication and chat system
- **`Ant Design`** for creating UI
- **`Apollo Client`** for client state management
- **`Typescript`** for type safety, cure for headache you get when props are flowing all over the app with no hint 
- **`Stripe`** for handling payments
- **`Cloudinary`** for image uploads
- **`Mapbox`** for showing maps


# Features

* Google Oauth
* Book Top Rated Rentals and Listings for Your Next Trip
* Chat system | Direct message the host/owner of rentals for more information.
* Create a listing and rent out your property, house or apartment and earn money.
* Update the Listing information
* Handle payments with stripe.
* Review and rating system.
* Filter and search for listings and rentals based on location.
* View the location of any listing or rental on a detailed map.

**and more....**


# Installation

1. Clone project

```
git clone git@github.com:saalikmubeen/paperhouses.git
```

## Manual

If you aren't a docker person, [You lost my respect for that. 😑]

cd into root project

```
1. cd server
```

`npm install` to to install server dependencies

`npm install --force` if `npm install` doesn't work due to conflicting dependencies

`Setup required environment variables:` 

*Make a **`.env`** file inside the server directory with below environment variables*
 
- MONGO_URI_DEV
- PUBLIC_URL: <http://localhost:3000>
- SECRET: my_super_secret_for_cookies
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- STRIPE_CLIENT_ID
- STRIPE_SECRET_KEY
- CLOUDINARY_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET
- MAPBOX_API_KEY


`npm run dev` to start development server

*Make sure you have mongoDB installed*

```
1. cd client
```

`npm install` installs client dependencies.

`Setup required environment variables:` 

*Make a **`.env`** file inside the client directory with below environment variables*
 
- REACT_APP_STRIPE_PUBLISHABLE_KEY
- REACT_APP_STRIPE_CLIENT_ID
- REACT_APP_MAPBOX_API_KEY

`npm run start` to start the react development server.


## Docker

**`If you use docker, respect++`**

Running project through docker is a breeze. You don't have to do any setup. Just one docker-compose command and magic

`cd into root project`

*First replace the environment variables in the docker-compose.yml file with your own.*

`Then run:`

```
docker-compose up --build
```

*Only if you have docker installed in the first place*