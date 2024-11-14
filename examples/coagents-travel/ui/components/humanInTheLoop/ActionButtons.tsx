import { Button } from "../ui/button";

export type ActionButtonsProps = {
    status: string;
    handler: any;
    approve: React.ReactNode;
    reject: React.ReactNode;
}

export const ActionButtons = ({ status, handler, approve, reject }: ActionButtonsProps) => (
  <div className="flex gap-4 justify-between">
    <Button 
      className="w-full"
      variant="outline"
      disabled={status === "complete"} 
      onClick={() => handler?.("CANCEL")}
    >
      {reject}
    </Button>
    <Button 
      className="w-full"
      disabled={status === "complete"} 
      onClick={() => handler?.("SEND")}
    >
      {approve}
    </Button>
  </div>
);