
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: "" }),
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: () => "/CV.json",
      transformResponse: (response) => ({
        name: response.personal_information.name,
        bio: response.additional_info,
        blog: response.personal_information.website,
        html_url: response.personal_information.github
      })
    }),
    getSocials: builder.query({
      query: () => "/CV.json",
      transformResponse: (response) => response.social_media.map(social => ({
        provider: social.platform.toLowerCase(),
        url: social.url
      }))
    }),
    getProjects: builder.query({
      query: () => "/CV.json",
      transformResponse: (response) => response.projects.map((project, index) => ({
        id: index,
        name: project.name,
        description: project.description,
        html_url: project.repository,
        homepage: project.demo
      }))
    })
  }),
});

export const { useGetUsersQuery, useGetSocialsQuery, useGetProjectsQuery } = apiSlice;
