import type { FriendRequest } from "@/types/user";
import { useAuth } from "@/utils/authContext";
import { UserService } from "@/utils/services/userService";
import { useEffect, useState } from "react";

export function useFriendRequests() {
  const { user } = useAuth();
  const [incomingRequests, setIncomingRequests] = useState<FriendRequest[]>([]);
  const [acceptedOutgoing, setAcceptedOutgoing] = useState<FriendRequest[]>([]);

  // Incoming pending requests (someone sent a request to me)
  useEffect(() => {
    if (!user) {
      setIncomingRequests([]);
      return;
    }

    const unsubscribe = UserService.subscribeToIncomingFriendRequests(
      user.id,
      (requests) => {
        setIncomingRequests(requests);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [user?.id]);

  // Outgoing accepted requests (someone accepted a request I sent)
  useEffect(() => {
    if (!user) {
      setAcceptedOutgoing([]);
      return;
    }

    const unsubscribe = UserService.subscribeToAcceptedFriendRequests(
      user.id,
      (requests) => {
        setAcceptedOutgoing(requests);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [user?.id]);

  return {
    incomingRequests,
    acceptedOutgoing,
  };
}



