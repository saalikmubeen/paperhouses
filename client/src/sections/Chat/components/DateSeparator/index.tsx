import React from "react";


export const DateSeparator = ({ date }: { date: string }) => {
    return (
        <div className="date-separator">
            <div className="date-label">{new Date(date).toDateString()}</div>
        </div>
    );
};
