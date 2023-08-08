import React from "react";
import { useContext } from "react";
import { ErrorContext } from "../contexts/ErrorContext";
import { Alert, Footer } from "@button-inc/bcgov-theme";
import Head from "next/head";

const DefaultLayout = ({ children }: any) => {
  const { error } = useContext(ErrorContext);

  return (
    <div id="page-wrap">
      <Head>
        <title></title>
        <meta name="description" content="IoT portal" />
      </Head>
      {error && <Alert variant="danger">{error}</Alert>}
      <main>{children}</main>
      <Footer />
      <style jsx>
        {`
          #page-wrap {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            background-color: #fafafc;
          }
          main {
            margin: auto;
            padding: 30px 40px;
            flex-grow: 1;
            width: 100%;
          }
        `}
      </style>
    </div>
  );
};

export default DefaultLayout;
