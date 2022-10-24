import NodeGeoCoder from "node-geocoder"

export const GeoCoder = NodeGeoCoder({
    provider: "mapbox",
    apiKey: process.env.MAPBOX_API_KEY,
});
