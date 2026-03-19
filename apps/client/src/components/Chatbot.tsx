/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect, useMemo } from "react";
import { useChat, fetchServerSentEvents } from "@tanstack/ai-react";
import { clientTools, createChatClientOptions, type AnyClientTool, type MessagePart } from "@tanstack/ai-client";
import {
  Box,
  CircularProgress,
  Collapse,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import PersonIcon from "@mui/icons-material/Person";
import BuildIcon from "@mui/icons-material/Build";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import PsychologyIcon from "@mui/icons-material/Psychology";

function JsonBlock({ label, data }: { label: string; data: unknown }) {
  const [open, setOpen] = useState(false);
  return (
    <Box sx={{ mt: 0.5 }}>
      <Box
        onClick={() => setOpen((v) => !v)}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        {open ? <ExpandLessIcon sx={{ fontSize: 13 }} /> : <ExpandMoreIcon sx={{ fontSize: 13 }} />}
        <Typography variant="caption" sx={{ fontStyle: "italic", opacity: 0.85 }}>
          {label}
        </Typography>
      </Box>
      <Collapse in={open}>
        <Box
          component="pre"
          sx={{
            p: 1,
            mt: 0.5,
            m: 0,
            bgcolor: "rgba(0,0,0,0.18)",
            borderRadius: 1,
            fontSize: 11,
            overflowX: "auto",
            lineHeight: 1.5,
          }}
        >
          {typeof data === "object" ? JSON.stringify(data, null, 2) : String(data)}
        </Box>
      </Collapse>
    </Box>
  );
}

function ReasoningBlock({ content }: { content: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Box
      sx={{
        mb: 0.5,
        border: "1px dashed",
        borderColor: "divider",
        borderRadius: 1.5,
        p: 0.75,
        bgcolor: "action.hover",
        maxWidth: "90%",
      }}
    >
      <Box
        onClick={() => setOpen((v) => !v)}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          cursor: "pointer",
          userSelect: "none",
        }}
      >
        <PsychologyIcon sx={{ fontSize: 14, color: "text.secondary" }} />
        <Typography variant="caption" color="text.secondary" fontStyle="italic" sx={{ flexGrow: 1 }}>
          Reasoning
        </Typography>
        {open ? (
          <ExpandLessIcon sx={{ fontSize: 13, color: "text.secondary" }} />
        ) : (
          <ExpandMoreIcon sx={{ fontSize: 13, color: "text.secondary" }} />
        )}
      </Box>
      <Collapse in={open}>
        <Typography
          variant="caption"
          component="div"
          color="text.secondary"
          sx={{
            mt: 0.5,
            whiteSpace: "pre-wrap",
            fontStyle: "italic",
            maxHeight: 180,
            overflowY: "auto",
          }}
        >
          {content}
        </Typography>
      </Collapse>
    </Box>
  );
}

function ToolCallPart<T extends AnyClientTool[]>({ part }: { part: Extract<MessagePart<T>, { type: "tool-call" }> }) {
  const isRunning = ["awaiting-input", "input-streaming", "input-complete"].includes(part.state);
  const isError = (part.state as never) === "error";
  const isSuccess = ["output-complete", "output-streaming"].includes(part.state);

  return (
    <Box
      sx={{
        mt: 0.75,
        p: 0.75,
        bgcolor: "rgba(0,0,0,0.15)",
        borderRadius: 1,
        border: "1px solid",
        borderColor: isError ? "error.light" : isSuccess ? "success.light" : "info.light",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <BuildIcon sx={{ fontSize: 13 }} />
        <Typography variant="caption" fontWeight={700}>
          {part.name}
        </Typography>
        <Box sx={{ ml: "auto", display: "flex", alignItems: "center", gap: 0.5 }}>
          {isRunning && (
            <>
              <CircularProgress size={10} />
              <Typography variant="caption" sx={{ opacity: 0.75 }}>
                calling…
              </Typography>
            </>
          )}
          {isSuccess && (
            <Tooltip title="Success">
              <CheckCircleIcon sx={{ fontSize: 13, color: "success.light" }} />
            </Tooltip>
          )}
          {isError && (
            <Tooltip title="Error">
              <ErrorIcon sx={{ fontSize: 13, color: "error.light" }} />
            </Tooltip>
          )}
        </Box>
      </Box>
      {part.input && Object.keys(part.input).length > 0 && <JsonBlock label="Input" data={part.input} />}
      {part.output !== undefined && <JsonBlock label="Output" data={part.output} />}
      {isError && (part as any).error && (
        <Typography variant="caption" color="error.light" sx={{ mt: 0.5, display: "block" }}>
          {String((part as any).error)}
        </Typography>
      )}
    </Box>
  );
}

export default function ChatBot<T extends AnyClientTool[]>({ tools }: { tools?: T }) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const chatOptions = useMemo(
    () =>
      createChatClientOptions({
        connection: fetchServerSentEvents(`${import.meta.env.VITE_API_URL}/chat`),
        tools: tools ? clientTools(...tools) : undefined,
      }),
    [tools]
  );

  const { messages, sendMessage, isLoading } = useChat(chatOptions);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      sendMessage(input.trim());
      setInput("");
    }
  };

  return (
    <Box
      sx={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        p: 1.5,
        gap: 1,
      }}
    >
      {/* Messages */}
      <Paper
        variant="outlined"
        sx={{
          flex: 1,
          overflowY: "auto",
          p: 1.5,
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
          bgcolor: "background.default",
        }}
      >
        {messages.length === 0 && (
          <Typography variant="caption" color="text.secondary" textAlign="center" sx={{ mt: 3 }}>
            Try: "What time is it?" or "Show me a warning notification"
          </Typography>
        )}

        {messages.map((message) => {
          const isAssistant = message.role === "assistant";
          const parts = message.parts ?? [];

          return (
            <Box
              key={message.id}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: isAssistant ? "flex-start" : "flex-end",
              }}
            >
              {/* Role chip */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  mb: 0.25,
                }}
              >
                {isAssistant ? (
                  <SmartToyIcon sx={{ fontSize: 13 }} color="primary" />
                ) : (
                  <PersonIcon sx={{ fontSize: 13 }} color="action" />
                )}
                <Typography variant="caption" color="text.secondary">
                  {isAssistant ? "Assistant" : "You"}
                </Typography>
              </Box>

              {/* Reasoning (assistant only, outside bubble) */}
              {isAssistant &&
                parts
                  .filter((p): p is Extract<(typeof parts)[number], { type: "thinking" }> => p.type === "thinking")
                  .map((p, i) => <ReasoningBlock key={i} content={p.content} />)}

              {/* Bubble */}
              <Paper
                elevation={0}
                sx={{
                  px: 1.5,
                  py: 0.75,
                  maxWidth: "88%",
                  bgcolor: isAssistant ? "primary.main" : "grey.100",
                  color: isAssistant ? "primary.contrastText" : "text.primary",
                  borderRadius: 2,
                }}
              >
                {parts.map((part, i) => {
                  if (part.type === "text")
                    return (
                      <Typography key={i} variant="body2" whiteSpace="pre-wrap">
                        {part.content}
                      </Typography>
                    );
                  if (part.type === "thinking") return null;
                  if (part.type === "tool-call") return <ToolCallPart key={i} part={part} />;
                  return null;
                })}
              </Paper>
            </Box>
          );
        })}

        {isLoading && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <SmartToyIcon fontSize="small" color="primary" />
            <CircularProgress size={14} />
            <Typography variant="caption" color="text.secondary">
              Thinking…
            </Typography>
          </Box>
        )}

        <div ref={bottomRef} />
      </Paper>

      {/* Input */}
      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Message…"
          disabled={isLoading}
          size="small"
          onSubmit={(e) => {
            handleSubmit(e);
          }}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton type="submit" disabled={!input.trim() || isLoading} size="small" color="primary">
                    {isLoading ? <CircularProgress size={16} /> : <SendIcon fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>
    </Box>
  );
}
