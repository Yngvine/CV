// https://redux-toolkit.js.org/rtk-query/overview
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
// Config
//import { githubUsername } from "../config"; // Removed as GitHub API is no longer used

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: "" }), // Base URL no longer needed
  endpoints: (builder) => ({
    //All GitHub endpoints are removed

  }),
});

export const getCVData = async () => {
  const response = await fetch('/CV.json');
  return response.json();
};

//The following lines are removed because they reference the removed endpoints
//export const { useGetUsersQuery, useGetSocialsQuery, useGetProjectsQuery } =
//  apiSlice;