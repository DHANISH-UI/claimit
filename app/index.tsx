import { Text, View } from "react-native";
import React from "react";
import HomePage from "@/screens/HomePage";
import SignInSignUpPage from "@/screens/SignInSignUpPage";
import Found from "@/screens/Found"
import Lost from "@/screens/Lost"

export default function Index() {
  return (
    // Choose one component to render
    //<HomePage />
    //<SignInSignUpPage />
    //<Found />
    <Lost />
  );
}