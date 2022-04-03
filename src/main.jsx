import { Buffer } from 'buffer';
window.Buffer = Buffer;
import React from "react";
import ReactDOM from "react-dom";
import "./styles/index.css";
import App from "./App";
import { MoralisProvider } from "react-moralis";




ReactDOM.render(
  <React.StrictMode>
    <MoralisProvider serverUrl="https://1ns2kb46oc3n.usemoralis.com:2053/server" appId="xdm7bsyssD5nWC0xp5XdFR6s5s7j9Jc51AVFLhzR">
    

      <App />

    </MoralisProvider>
  </React.StrictMode>,
  document.getElementById("root")
);