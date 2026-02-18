import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { getNotifications, respondToInvite } from "@/apis/notificationApis";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, X, Users } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export default function InvitationsPage() {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const location = useLocation();
  const highlightId = location.state?.highlightId;

  useEffect(() => {
    fetchInvitations();
  }, []);

  useEffect(() => {
    if (highlightId) {
      const element = document.getElementById(`invite-${highlightId}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [highlightId, invitations]);

  const fetchInvitations = async () => {
    setLoading(true);
    try {
      const data = await getNotifications();
      const invites = data.notifications.filter(n => n.type === "invite");
      setInvitations(invites);
    } catch (error) {
      toast.error("Failed to fetch invitations");
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (notificationId, action) => {
    setProcessingId(notificationId);
    try {
      await respondToInvite(notificationId, action);
      toast.success(action === "accept" ? "Invitation accepted!" : "Invitation rejected");
      fetchInvitations();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to respond to invitation");
    } finally {
      setProcessingId(null);
    }
  };

  const pendingInvites = invitations.filter(i => i.status === "pending");
  const processedInvites = invitations.filter(i => i.status !== "pending");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Invitations</h1>
        <p className="text-muted-foreground mt-1">
          Manage your group invitations
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading invitations...</p>
        </div>
      ) : (
        <>
          {pendingInvites.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Pending Invitations</h2>
              {pendingInvites.map((invite) => (
                <Card
                  key={invite._id}
                  id={`invite-${invite._id}`}
                  className={`p-4 transition-all ${
                    highlightId === invite._id
                      ? "ring-2 ring-blue-500 shadow-lg"
                      : ""
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{invite.message}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(invite.createdAt), { addSuffix: true })}
                      </p>
                      {invite.groupId && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Group: {invite.groupId.name}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleRespond(invite._id, "accept")}
                        disabled={processingId === invite._id}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRespond(invite._id, "reject")}
                        disabled={processingId === invite._id}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {processedInvites.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Past Invitations</h2>
              {processedInvites.map((invite) => (
                <Card key={invite._id} className="p-4 opacity-60">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                      <Users className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{invite.message}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(invite.createdAt), { addSuffix: true })}
                      </p>
                      <p className={`text-sm font-medium mt-2 ${
                        invite.status === "accepted" ? "text-green-600" : "text-red-600"
                      }`}>
                        {invite.status === "accepted" ? "Accepted" : "Rejected"}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {invitations.length === 0 && (
            <Card className="p-12">
              <div className="text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No invitations</h3>
                <p className="text-muted-foreground">
                  You don't have any group invitations at the moment
                </p>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
