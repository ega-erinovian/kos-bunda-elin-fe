import { MoreVertical, Layers } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { formatCurrency, cn } from "@/lib/utils";
import type { Room } from "../types";
import { StatusBadge } from "./StatusBadge";

export function MobileRoomCard({ room }: { room: Room }) {
  const isMaintenance = room.status === "nonaktif";
  const hasTenant = room.status === "terisi" && room.tenant;

  return (
    <Card
      variant="bordered"
      className={cn(
        isMaintenance && "border-outline-variant/40 bg-surface-container-low opacity-80",
      )}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="font-heading text-heading-lg-mobile font-bold text-on-surface">
              Kamar {room.number}
            </CardTitle>
            <CardDescription className="flex items-center gap-1 text-body-md text-on-surface-variant">
              <Layers className="h-4 w-4" />
              Lantai {room.floor}
            </CardDescription>
          </div>
          <StatusBadge status={room.status} />
        </div>
      </CardHeader>

      {hasTenant && (
        <CardContent>
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">{room.tenant!.initials}</AvatarFallback>
            </Avatar>
            <span className="text-label-md text-on-surface">{room.tenant!.name}</span>
          </div>
        </CardContent>
      )}

      <CardFooter>
        <div className="flex w-full items-end justify-between">
          <div>
            <p className="text-label-sm text-on-surface-variant">Harga per bulan</p>
            <p className="font-heading text-heading-md text-on-surface">
              {formatCurrency(room.price)}
            </p>
          </div>
          <button className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-primary/5 hover:text-primary">
            <MoreVertical className="h-5 w-5" />
          </button>
        </div>
      </CardFooter>
    </Card>
  );
}
