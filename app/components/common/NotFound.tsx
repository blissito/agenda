import React from "react";
import { PrimaryButton } from "./primaryButton";
import { TopBar } from "./topBar";

export const NotFound = () => {
  return (
    <section className="bg-white ">
      <TopBar />
      <div className=" pt-[180px] max-w-7xl w-[90%] mx-auto lg:w-full flex justify-center items-center">
        <div className=" flex flex-col items-center">
          <img className="max-w-5xl" src="/images/404.svg" alt="404" />
          <h3 className="text-4xl font-satoMedium">
            Ups ¡Esta página no existe!
          </h3>
          <PrimaryButton as="Link" to="/" className="w-[240px] mt-12">
            Volver a la página principal
          </PrimaryButton>
        </div>
      </div>
    </section>
  );
};
