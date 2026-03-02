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
} from "@food-trek/schemas";

const AuthTag = "Auth";
const FilesTag = "Files";

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

export function generateOpenAPIDocument(
  serverUrl: string
): ReturnType<typeof createDocument> {
  return createDocument({
    openapi: "3.1.0",
    info: {
      title: "FoodTrek API",
      version: "1.0.0",
      description:
        "REST API for FoodTrek",
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
    },
  });
}
