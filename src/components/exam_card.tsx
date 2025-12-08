// src/components/ExamCard.tsx
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { BarChart3, Clock, Edit, Trash } from "lucide-react";
import { Link } from "react-router-dom";
import * as React from "react";

export interface ExamCardProps {
  id: string;
  title: string;
  subjectName: string;
  level: string;
  durationInMinutes?: number;
  thumbnailUrl: string;
  onDelete: () => void;
}

const ExamCard = ({
  id,
  title,
  subjectName,
  level,
  durationInMinutes,
  thumbnailUrl,
  onDelete,
}: ExamCardProps) => {
  const formatDuration = (minutes: number) => {
    if (!minutes && minutes !== 0) return "";
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h${mins ? ` ${mins}m` : ""}`;
  };

  return (
    <Card className="group flex h-full flex-col overflow-hidden rounded-xl">
      {/* Thumbnail */}
      <div className="relative aspect-[16/9] w-full shrink-0 bg-muted">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : null}

        {/* Level badge */}
        <div className="absolute left-2 top-2">
          <Badge
            variant="secondary"
            className="text-[10px] leading-none px-2 py-0.5 rounded-md"
          >
            {level}
          </Badge>
        </div>
      </div>

      <CardContent className="flex flex-1 flex-col gap-2 p-3 sm:p-4">
        {/* Title */}
        <h3
          title={title}
          className="min-w-0 text-sm font-medium leading-tight line-clamp-2 break-words"
        >
          {title}
        </h3>

        {/* Meta */}
        <div className="mt-0.5 grid grid-cols-1 gap-1.5 text-muted-foreground">
          <div className="flex items-center gap-1.5 text-xs leading-none">
            <span className="font-medium text-foreground/80">Subject:</span>
            <span className="min-w-0 truncate" title={subjectName}>
              {subjectName}
            </span>
          </div>

          {typeof durationInMinutes === "number" && (
            <div className="flex items-center gap-1.5 text-xs leading-none">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <span>{formatDuration(durationInMinutes)}</span>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="mt-auto flex flex-col gap-2 p-3 sm:p-4">
        {/* Primary actions */}
        <div className="grid w-full grid-cols-2 gap-2">
          <Button asChild size="sm"     className="h-8 text-xs bg-blue-900 text-white hover:bg-blue-900/90 focus-visible:ring-blue-900"
>
            <Link to={`/exams/${id}/edit`}>
              <Edit className="mr-1.5 h-3.5 w-3.5" />
              Edit
            </Link>
          </Button>

          <Button asChild variant="secondary" size="sm" className="h-8 text-xs">
            <Link to={`/exam/view/${id}/`}>
              <BarChart3 className="mr-1.5 h-3.5 w-3.5" />
              Results
            </Link>
          </Button>
        </div>

        {/* Destructive action */}
        <Button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete();
          }}
          variant="ghost"
          size="sm"
          className="h-8 w-full text-xs text-destructive hover:text-destructive hover:bg-destructive/10 transition-all duration-200 border border-transparent hover:border-destructive/20"
        >
          <Trash className="mr-1.5 h-3.5 w-3.5" />
          Delete Exam
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ExamCard;
