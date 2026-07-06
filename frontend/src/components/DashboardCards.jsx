import { ClipboardList, AlertTriangle, CheckCircle2, Clock3 } from "lucide-react";

export default function DashboardCards({ tasks = [] }) {
  const total = tasks.length;
  const high = tasks.filter(t => t.priority === "High").length;
  const completed = tasks.filter(t => t.status === "Done").length;
  const pending = tasks.filter(t => t.status !== "Done").length;

  const cards = [
    {
      title: "Total Tasks",
      value: total,
      icon: ClipboardList,
      color: "bg-blue-500",
    },
    {
      title: "High Priority",
      value: high,
      icon: AlertTriangle,
      color: "bg-red-500",
    },
    {
      title: "Completed",
      value: completed,
      icon: CheckCircle2,
      color: "bg-green-500",
    },
    {
      title: "Pending",
      value: pending,
      icon: Clock3,
      color: "bg-orange-500",
    },
  ];

  return (
    <div className="grid md:grid-cols-4 gap-6 mt-8">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="bg-white rounded-xl shadow-md p-6 flex justify-between items-center hover:shadow-xl transition"
          >
            <div>
              <p className="text-gray-500">{card.title}</p>

              <h2 className="text-3xl font-bold mt-2">
                {card.value}
              </h2>
            </div>

            <div className={`${card.color} p-4 rounded-xl`}>
              <Icon className="text-white" size={28} />
            </div>
          </div>
        );
      })}
    </div>
  );
}