import React from "react";
import { render } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import { BrowserRouter } from "react-router-dom";
import { Home } from "../index";

// Object.defineProperty(window, "matchMedia", {
//     writable: true,
//     value: jest.fn().mockImplementation((query) => ({
//         matches: false,
//         media: query,
//         onchange: null,
//         addListener: jest.fn(), // Deprecated
//         removeListener: jest.fn(), // Deprecated
//         addEventListener: jest.fn(),
//         removeEventListener: jest.fn(),
//         dispatchEvent: jest.fn(),
//     })),
// });

describe("Home", () => {
    window.scrollTo = () => {};
    window.matchMedia =
        window.matchMedia ||
        function () {
            return {
                matches: false,
                addListener: function () {},
                removeListener: function () {},
            };
        };

    describe("Search Input", () => {
        it("renders an empty search input on initial render", () => {
            const {getByPlaceholderText} = render(
                <MockedProvider mocks={[]}>
                    <BrowserRouter>
                        <Home />
                    </BrowserRouter>
                </MockedProvider>
            );

            const searchInput = getByPlaceholderText("Search 'Los Angeles'") as HTMLInputElement;

            expect(searchInput.value).toEqual("");
        });

    });
});
