import { apiSlice } from "../../api/apiSlice";
import apiRoutes from "@/appConfig/apiRoutes";

export const blogsApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getBlogs: builder.query({
            query: (params) => ({
                url: apiRoutes.blogs,
                params,
            }),
            providesTags: ["Blogs"],
        }),
        getBlogCategory: builder.query({
            query: () => apiRoutes.blogCategory,
            providesTags: ["BlogCategories"],
        }),
        getBlogDetail: builder.query({
            query: (slug) => `${apiRoutes.blogs}/${slug}`,
            providesTags: (result, error, slug) => [{ type: "Blogs", id: slug }],
        }),
        submitBlogComment: builder.mutation({
            query: (data) => ({
                url: apiRoutes.blogComment,
                method: "POST",
                body: data,
            }),
            invalidatesTags: (result, error, { slug }) => [
                { type: "Blogs", id: slug },
            ],
        }),
    }),
});

export const {
    useGetBlogsQuery,
    useGetBlogCategoryQuery,
    useGetBlogDetailQuery,
    useSubmitBlogCommentMutation,
} = blogsApi;
