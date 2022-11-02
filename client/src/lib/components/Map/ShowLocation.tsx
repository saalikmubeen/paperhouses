import React, { useEffect, useRef, useCallback } from "react";
// eslint-disable-next-line import/no-webpack-loader-syntax
import mapboxgl, { Map } from "mapbox-gl";
import mbxGeocoding from "@mapbox/mapbox-sdk/services/geocoding";
import "mapbox-gl/dist/mapbox-gl.css";
import "./map.css";

// The following is required to stop "npm build" from transpiling mapbox code.
// notice the exclamation point in the import.
// @ts-ignore 
// eslint-disable-next-line import/no-webpack-loader-syntax, import/no-unresolved
mapboxgl.workerClass = require("worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker").default;

export const ShowLocation = ({ address }  : {address: string}) => {
    const map = useRef<Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_API_KEY as string;

    const fetchData = useCallback(() => {
        const geocodingClient = mbxGeocoding({
            accessToken: mapboxgl.accessToken,
        });

        // geocoding with countries
        return geocodingClient
            .forwardGeocode({
                query: address,

            })
            .send()
            .then((response) => {
                const match = response.body;
                const coordinates = match.features[0].geometry.coordinates;
                const placeName = match.features[0].place_name;
                const center = match.features[0].center;

                return {
                    type: "Feature",
                    center: center,
                    geometry: {
                        type: "Point",
                        coordinates: coordinates,
                    },
                    properties: {
                        description: placeName,
                    },
                };
            });
    }, [address]);

    useEffect(() => {
        // if (map.current) return; // Checks if there's an already existing map initialised.

        map.current = new mapboxgl.Map({
            container: mapContainerRef.current as HTMLDivElement,
            style: "mapbox://styles/mapbox/streets-v11",
            zoom: 9,
            center: [3.361881, 6.672557],
        });

        // clean up on unmount
        return () => {
            if(map.current) {
                map.current.remove();
            }
        };
    }, []);

    useEffect(() => {

        if (!map || !map.current) {
            return;
        }; // Waits for the map to initialise

        const results = fetchData();

        results.then((marker) => {
            // create a HTML element for each feature
            var el = document.createElement("div");
            el.className = "circle";

            if(!map.current) {
                return
            }

            // make a marker for each feature and add it to the map
            new mapboxgl.Marker(el)
                .setLngLat(marker.geometry.coordinates as any)
                .setPopup(
                    new mapboxgl.Popup({ offset: 25 }) // add popups
                        .setHTML("<p>" + marker.properties.description + "</p>")
                )
                .addTo(map.current);

            map.current.on("load", async () => {

                map.current!.flyTo({
                    center: marker.center as any,
                });
            });
        });
    }, [fetchData]);

    return (
        <div>
            <div ref={mapContainerRef} className="map-container" />
        </div>
    );
};
