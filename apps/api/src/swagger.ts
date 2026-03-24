import { z } from "zod";
import { createDocument } from "zod-openapi";
import {
  loginSchema,
  registerSchema,
  updateUserSchema,
  userInfoSchema,
  uploadFileResSchema,
  googleLoginSchema,
  errorResSchema,
  newPostDataSchema,
  postDataSchema,
  updatePostDataSchema,
  newCommentDataSchema,
  commentsCountSchema,
  commentDataSchema,
  newLikeDataSchema,
  likesCountSchema,
  likeDataSchema,
} from "@food-trek/schemas";

const AuthTag = "Auth";
const FilesTag = "Files";
const PostsTag = "Posts";
const CommentsTag = "Comments";
const LikesTag = "Likes";

const commonResponses = {
  400: {
    description: "Validation error",
    content: { "application/json": { schema: errorResSchema } },
  },
  401: {
    description: "Unauthorized - missing or invalid credentials",
    content: { "application/json": { schema: errorResSchema } },
  },
  500: {
    description: "Internal server error",
    content: { "application/json": { schema: errorResSchema } },
  },
} as const;
const INTERNAL_SERVER_ERROR_RESPONSE = { 500: commonResponses[500] } as const;

export function generateOpenAPIDocument(serverUrl: string): ReturnType<typeof createDocument> {
  return createDocument({
    openapi: "3.1.0",
    info: {
      title: "FoodTrek API",
      version: "1.0.0",
      description: "REST API for FoodTrek",
    },
    servers: [{ url: serverUrl }],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "accessToken",
          description: "JWT access token stored in an HTTP-only cookie",
        },
      },
    },
    paths: {
      "/api/auth/register": {
        post: {
          tags: [AuthTag],
          summary: "Register a new user",
          requestBody: {
            required: true,
            content: { "application/json": { schema: registerSchema } },
          },
          responses: {
            201: {
              description: "User created and auth cookies set",
              content: { "application/json": { schema: userInfoSchema } },
            },
            400: commonResponses[400],
            409: {
              description: "Username or email already in use",
              content: { "application/json": { schema: errorResSchema } },
            },
            ...INTERNAL_SERVER_ERROR_RESPONSE,
          },
        },
      },

      "/api/auth/login": {
        post: {
          tags: [AuthTag],
          summary: "Log in with username/email and password",
          requestBody: {
            required: true,
            content: { "application/json": { schema: loginSchema } },
          },
          responses: {
            200: {
              description: "Login successful and auth cookies set",
              content: { "application/json": { schema: userInfoSchema } },
            },
            400: commonResponses[400],
            401: commonResponses[401],
            ...INTERNAL_SERVER_ERROR_RESPONSE,
          },
        },
      },

      "/api/auth/refresh": {
        post: {
          tags: [AuthTag],
          summary: "Refresh access token using refresh token cookie",
          security: [{ cookieAuth: [] }],
          responses: {
            200: {
              description: "Tokens refreshed and auth cookies updated",
              content: { "application/json": { schema: userInfoSchema } },
            },
            401: commonResponses[401],
            ...INTERNAL_SERVER_ERROR_RESPONSE,
          },
        },
      },

      "/api/auth/logout": {
        post: {
          tags: [AuthTag],
          summary: "Log out and clear auth cookies",
          security: [{ cookieAuth: [] }],
          responses: {
            204: { description: "Logged out successfully" },
            ...INTERNAL_SERVER_ERROR_RESPONSE,
          },
        },
      },

      "/api/auth/google": {
        post: {
          tags: [AuthTag],
          summary: "Authenticate with a Google OAuth ID token",
          requestBody: {
            required: true,
            content: { "application/json": { schema: googleLoginSchema } },
          },
          responses: {
            200: {
              description: "Google auth successful and auth cookies set",
              content: { "application/json": { schema: userInfoSchema } },
            },
            400: commonResponses[400],
            401: commonResponses[401],
            ...INTERNAL_SERVER_ERROR_RESPONSE,
          },
        },
      },

      "/api/auth/user": {
        get: {
          tags: [AuthTag],
          summary: "Get the currently authenticated user",
          security: [{ cookieAuth: [] }],
          responses: {
            200: {
              description: "Authenticated user info",
              content: { "application/json": { schema: userInfoSchema } },
            },
            401: commonResponses[401],
            ...INTERNAL_SERVER_ERROR_RESPONSE,
          },
        },
        patch: {
          tags: [AuthTag],
          summary: "Update the authenticated user's username or avatar",
          security: [{ cookieAuth: [] }],
          requestBody: {
            required: true,
            content: { "application/json": { schema: updateUserSchema } },
          },
          responses: {
            200: {
              description: "User updated successfully",
              content: { "application/json": { schema: userInfoSchema } },
            },
            400: commonResponses[400],
            401: commonResponses[401],
            404: {
              description: "User not found",
              content: { "application/json": { schema: errorResSchema } },
            },
            409: {
              description: "Username already in use",
              content: { "application/json": { schema: errorResSchema } },
            },
            ...INTERNAL_SERVER_ERROR_RESPONSE,
          },
        },
      },

      "/api/files": {
        post: {
          tags: [FilesTag],
          summary: "Upload an image file",
          requestBody: {
            required: true,
            description: "Multipart form with a single image file (max 10 MB)",
            content: {
              "multipart/form-data": {
                schema: z.object({
                  file: z.any().meta({
                    type: "string",
                    format: "binary",
                    description: "Image file (jpg, png, webp, ...)",
                  }),
                }),
              },
            },
          },
          responses: {
            200: {
              description: "File uploaded and returns the public URL",
              content: { "application/json": { schema: uploadFileResSchema } },
            },
            400: commonResponses[400],
            ...INTERNAL_SERVER_ERROR_RESPONSE,
          },
        },
      },

      "/api/posts": {
        post: {
          tags: [PostsTag],
          summary: "Create a new post",
          requestBody: {
            required: true,
            content: { "application/json": { schema: newPostDataSchema } },
          },
          responses: {
            201: {
              description: "Post created successfully",
              content: {
                "application/json": {
                  schema: newPostDataSchema.extend({ _id: z.string(), userId: z.string(), createdAt: z.date() }),
                },
              },
            },
            400: {
              description: "Validation error",
              content: { "text/plain": { schema: { type: "string", example: "image-url and text are required" } } },
            },
            500: {
              description: "Internal server error",
              content: { "text/plain": { schema: { type: "string", example: "error creating post" } } },
            },
          },
        },
      },

      "/api/posts/home-feed": {
        get: {
          tags: [PostsTag],
          summary: "Get home feed posts",
          parameters: [{ name: "search", in: "query", required: false, schema: { type: "string" } }],
          responses: {
            200: {
              description: "Posts retrieved successfully",
              content: { "application/json": { schema: z.array(postDataSchema) } },
            },
            500: {
              description: "Internal server error",
              content: { "text/plain": { schema: { type: "string", example: "error retrieving posts" } } },
            },
          },
        },
      },

      "/api/posts/user-page": {
        get: {
          tags: [PostsTag],
          summary: "Get user page posts",
          responses: {
            200: {
              description: "Posts retrieved successfully",
              content: { "application/json": { schema: z.array(postDataSchema) } },
            },
            500: {
              description: "Internal server error",
              content: { "text/plain": { schema: { type: "string", example: "error retrieving posts" } } },
            },
          },
        },
      },

      "/api/posts/embedding-batch/update-all": {
        post: {
          tags: [PostsTag],
          summary: "Batch update embeddings for all stale or missing posts",
          security: [{ cookieAuth: [] }],
          responses: {
            200: {
              description: "Batch update completed",
              content: {
                "application/json": {
                  schema: z.object({
                    success: z.boolean(),
                    message: z.string(),
                    updated: z.number(),
                    failed: z.number(),
                  }),
                },
              },
            },
            ...INTERNAL_SERVER_ERROR_RESPONSE,
          },
        },
      },

      "/api/posts/{postId}": {
        patch: {
          tags: [PostsTag],
          summary: "Update an existing post",
          parameters: [{ name: "postId", in: "path", required: true, schema: { type: "string" } }],
          requestBody: {
            required: true,
            content: { "application/json": { schema: updatePostDataSchema } },
          },
          responses: {
            200: {
              description: "Post updated successfully",
              content: {
                "application/json": {
                  schema: newPostDataSchema.extend({ _id: z.string(), userId: z.string(), createdAt: z.date() }),
                },
              },
            },
            400: {
              description: "Validation error",
              content: {
                "text/plain": { schema: { type: "string", example: "post-id is required / invalid update data" } },
              },
            },
            403: {
              description: "Not authorized",
              content: { "text/plain": { schema: { type: "string", example: "not authorized" } } },
            },
            404: {
              description: "Post not found",
              content: { "text/plain": { schema: { type: "string", example: "post not found" } } },
            },
            500: {
              description: "Internal server error",
              content: { "text/plain": { schema: { type: "string", example: "error updating post" } } },
            },
          },
        },
        delete: {
          tags: [PostsTag],
          summary: "Delete an existing post",
          parameters: [{ name: "postId", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            200: {
              description: "Post deleted successfully",
              content: {
                "application/json": {
                  schema: z.object({
                    postsDeletedCount: z.number(),
                    commentsDeletedCount: z.number(),
                    likesDeletedCount: z.number(),
                  }),
                },
              },
            },
            400: {
              description: "Validation error",
              content: { "text/plain": { schema: { type: "string", example: "post-id is required" } } },
            },
            403: {
              description: "Not authorized",
              content: { "text/plain": { schema: { type: "string", example: "not authorized" } } },
            },
            404: {
              description: "Post not found",
              content: { "text/plain": { schema: { type: "string", example: "post not found" } } },
            },
            500: {
              description: "Internal server error",
              content: { "text/plain": { schema: { type: "string", example: "error deleting post" } } },
            },
          },
        },
      },

      "/api/comments": {
        post: {
          tags: [CommentsTag],
          summary: "Add a new comment",
          requestBody: {
            required: true,
            content: { "application/json": { schema: newCommentDataSchema } },
          },
          responses: {
            201: {
              description: "Comment created successfully",
              content: {
                "application/json": {
                  schema: newCommentDataSchema.extend({ _id: z.string(), userId: z.string(), createdAt: z.date() }),
                },
              },
            },
            400: {
              description: "Validation error",
              content: { "text/plain": { schema: { type: "string", example: "post-id and text are required" } } },
            },
            404: {
              description: "Post not found",
              content: { "text/plain": { schema: { type: "string", example: "post not found" } } },
            },
            500: {
              description: "Internal server error",
              content: { "text/plain": { schema: { type: "string", example: "error creating comment" } } },
            },
          },
        },
      },

      "/api/comments/post/{postId}/count": {
        get: {
          tags: [CommentsTag],
          summary: "Get comment count of a specific post",
          parameters: [{ name: "postId", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            200: {
              description: "Comments count retrieved successfully",
              content: { "application/json": { schema: commentsCountSchema } },
            },
            400: {
              description: "Validation error",
              content: { "text/plain": { schema: { type: "string", example: "post-id is required" } } },
            },
            404: {
              description: "Post not found",
              content: { "text/plain": { schema: { type: "string", example: "post not found" } } },
            },
            500: {
              description: "Internal server error",
              content: { "text/plain": { schema: { type: "string", example: "error retrieving comments count" } } },
            },
          },
        },
      },

      "/api/comments/post/{postId}": {
        get: {
          tags: [CommentsTag],
          summary: "Get comments of a specific post",
          parameters: [{ name: "postId", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            200: {
              description: "Comments retrieved successfully",
              content: { "application/json": { schema: z.array(commentDataSchema) } },
            },
            400: {
              description: "Validation error",
              content: { "text/plain": { schema: { type: "string", example: "post-id is required" } } },
            },
            404: {
              description: "Post not found",
              content: { "text/plain": { schema: { type: "string", example: "post not found" } } },
            },
            500: {
              description: "Internal server error",
              content: { "text/plain": { schema: { type: "string", example: "error retrieving comments" } } },
            },
          },
        },
      },

      "/api/likes": {
        post: {
          tags: [LikesTag],
          summary: "Add a new like",
          requestBody: {
            required: true,
            content: { "application/json": { schema: newLikeDataSchema } },
          },
          responses: {
            201: {
              description: "Like created successfully",
              content: {
                "application/json": {
                  schema: newLikeDataSchema.extend({ _id: z.string(), userId: z.string(), createdAt: z.date() }),
                },
              },
            },
            400: {
              description: "Validation error",
              content: { "text/plain": { schema: { type: "string", example: "post-id is required" } } },
            },
            404: {
              description: "Post not found",
              content: { "text/plain": { schema: { type: "string", example: "post not found" } } },
            },
            500: {
              description: "Internal server error",
              content: { "text/plain": { schema: { type: "string", example: "error adding like" } } },
            },
          },
        },
      },

      "/api/likes/logged-in-user/post/{postId}": {
        get: {
          tags: [LikesTag],
          summary: "Get the logged-in user's like on a specific post",
          parameters: [{ name: "postId", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            200: {
              description: "Like retrieved successfully",
              content: { "application/json": { schema: likeDataSchema } },
            },
            400: {
              description: "Validation error",
              content: { "text/plain": { schema: { type: "string", example: "post-id is required" } } },
            },
            404: {
              description: "Post not found",
              content: { "text/plain": { schema: { type: "string", example: "post not found" } } },
            },
            500: {
              description: "Internal server error",
              content: { "text/plain": { schema: { type: "string", example: "error retrieving like" } } },
            },
          },
        },
      },

      "/api/likes/post/{postId}/count": {
        get: {
          tags: [LikesTag],
          summary: "Get like count of a specific post",
          parameters: [{ name: "postId", in: "path", required: true, schema: { type: "string" } }],
          responses: {
            200: {
              description: "Likes count retrieved successfully",
              content: { "application/json": { schema: likesCountSchema } },
            },
            400: {
              description: "Validation error",
              content: { "text/plain": { schema: { type: "string", example: "post-id is required" } } },
            },
            404: {
              description: "Post not found",
              content: { "text/plain": { schema: { type: "string", example: "post not found" } } },
            },
            500: {
              description: "Internal server error",
              content: { "text/plain": { schema: { type: "string", example: "error retrieving likes count" } } },
            },
          },
        },
      },
    },
  });
}
