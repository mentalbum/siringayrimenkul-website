"use client";

import ReactDOM from "react-dom";

export function ResourceHints() {
  ReactDOM.preconnect("https://maps.googleapis.com");
  ReactDOM.preconnect("https://maps.gstatic.com");

  return null;
}
