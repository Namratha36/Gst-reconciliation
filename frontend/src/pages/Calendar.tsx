import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calendar as CalendarIcon, Clock } from "lucide-react";

export default function Calendar() {
  const events = [
    { date: 'July 11, 2026', title: 'GSTR-1 Due Date', type: 'Filing', status: 'Upcoming' },
    { date: 'July 14, 2026', title: 'GSTR-2B Generation', type: 'System', status: 'Pending' },
    { date: 'July 20, 2026', title: 'GSTR-3B Due Date', type: 'Filing', status: 'Upcoming' },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Compliance Calendar</h1>
        <p className="text-sm text-muted-foreground mt-1">Track upcoming GST statutory deadlines.</p>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="text-sm font-semibold flex items-center">
            <CalendarIcon className="w-4 h-4 mr-2 text-primary" />
            Upcoming Deadlines
          </CardTitle>
          <CardDescription>Never miss a filing date.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 text-xs uppercase text-muted-foreground border-b">
              <tr>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Event</th>
                <th className="px-6 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {events.map((e, i) => (
                <tr key={i} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-semibold text-foreground flex items-center">
                    <Clock className="w-3 h-3 mr-2 text-muted-foreground" />
                    {e.date}
                  </td>
                  <td className="px-6 py-4">{e.title}</td>
                  <td className="px-6 py-4 text-muted-foreground">{e.type}</td>
                  <td className="px-6 py-4 text-right">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border bg-primary/10 text-primary border-primary/20">
                      {e.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
