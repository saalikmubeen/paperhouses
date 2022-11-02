import React, { useEffect, useRef, useCallback, useState } from "react";
import mapboxgl, { Map } from "mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import mbxGeocoding from "@mapbox/mapbox-sdk/services/geocoding";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
// import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import "./map.css";

// The following is required to stop "npm build" from transpiling mapbox code.
// notice the exclamation point in the import.
// @ts-ignore 
// eslint-disable-next-line import/no-webpack-loader-syntax, import/no-unresolved
// mapboxgl.workerClass = require("worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker").default;


interface Props {
    setFullAddress: (fullAddress: {
        address: string;
        city: string;
        state: string;
        postalCode: string;
    }) => void;
}

export const SelectLocation = ({setFullAddress}: Props) => {
    const [lng, setLng] = useState(-70.9);
    const [lat, setLat] = useState(42.35);
    const map = useRef<Map | null>(null);
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_API_KEY as string;

    const reverseGeoCode = useCallback(({ lat, lng }: {lat: number, lng: number}) => {
        const geocodingClient = mbxGeocoding({
            accessToken: mapboxgl.accessToken,
        });

        // geocoding with countries
        return geocodingClient
            .reverseGeocode({
                query: [lng, lat]
            })
            .send()
            .then((response) => {
                const data = response.body;
                console.log(data)
                 let address = "";
                 let city= "";
                 let state = "";
                 let postalCode = "";
                
                 data.features.forEach((feature) => {
                     if (feature.place_type[0] === "address") {
                        address = feature.place_name
                     }

                     if (feature.place_type[0] === "region") {
                         state = feature.text
                     }

                     if (feature.place_type[0] === "place") {
                         city += ` ${feature.text}`;
                     }

                      if (feature.place_type[0] === "district") {
                         city += ` ${feature.text}`;
                      }

                     if(feature.place_type[0] === "postcode") {
                         postalCode = feature.text;
                     }
                 });
                

                setFullAddress({
                    address,
                    city,
                    state,
                    postalCode
                });
                

            });
    }, []);

    useEffect(() => {
        // if (map.current) return; // Checks if there's an already existing map initialised.

        map.current = new mapboxgl.Map({
            container: mapContainerRef.current as HTMLDivElement,
            style: "mapbox://styles/mapbox/streets-v11",
            center: [lng, lat],
            zoom: 8,
        });

        const marker = new mapboxgl.Marker({
            draggable: true,
        })
            .setLngLat([lng, lat])
            .addTo(map.current);

        const geocoder = new MapboxGeocoder({
            accessToken: mapboxgl.accessToken,
            mapboxgl: mapboxgl,
        });

        geocoder.on("result", function (e) {
            console.log(e.result.center);
            geocoder.clear();
                marker
                .setLngLat(e.result.center)
        });

        map.current.addControl(geocoder)

        function onDragEnd() {
            const lngLat = marker.getLngLat();
            setLat(lngLat.lat);
            setLng(lngLat.lng);

            reverseGeoCode({lng: lngLat.lng, lat: lngLat.lat});
        }

        marker.on("dragend", onDragEnd);

        if(!map.current) {
            return
        }

        // clean up on unmount
        return () => {
            if (map.current) {
                map.current.remove();
            }
        };
    }, [reverseGeoCode]);


    return (
        <div>
            <div ref={mapContainerRef} className="map-container" />
        </div>
    );
};
