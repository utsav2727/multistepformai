import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText, CheckCircle, TrendingUp } from "lucide-react";

interface SubmissionsStatsProps {
  totalSubmissions: number;
  completedSubmissions: number;
}

export function SubmissionsStats({
  totalSubmissions,
  completedSubmissions,
}: SubmissionsStatsProps) {
  const completionRate =
    totalSubmissions > 0
      ? Math.round((completedSubmissions / totalSubmissions) * 100)
      : 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between px-4 pt-4 pb-1">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Submissions
          </CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="text-2xl font-bold">{totalSubmissions}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between px-4 pt-4 pb-1">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Completed
          </CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="text-2xl font-bold">{completedSubmissions}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between px-4 pt-4 pb-1">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Completion Rate
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="text-2xl font-bold">{completionRate}%</div>
        </CardContent>
      </Card>
    </div>
  );
}
