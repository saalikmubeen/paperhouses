import React from 'react';
import ReactDOM from 'react-dom/client';
import {
    ApolloClient,
    ApolloProvider,
    InMemoryCache,
    createHttpLink,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import reportWebVitals from './reportWebVitals';
import "./styles/index.css";
import { App } from './App';

const httpLink = createHttpLink({
    uri: "/api",
});

const tokenLink = setContext((_, { headers }) => {
    // get the X-CSRF-TOKEN token from session storage if it exists
    const token = sessionStorage.getItem("token");
    console.log(token)
    // return the headers to the context so httpLink can read them
    return {
        headers: {
            ...headers,
            "X-CSRF-TOKEN": sessionStorage.getItem("token") || "",
        },
    };
});


const client = new ApolloClient({
    link: tokenLink.concat(httpLink),
    credentials: 'include',
    cache: new InMemoryCache(),
});



const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
    <React.StrictMode>
        <ApolloProvider client={client}>
            <App />
        </ApolloProvider>
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals

reportWebVitals();
