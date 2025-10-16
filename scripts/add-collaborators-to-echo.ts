/**
 * Development helper to add collaborators to an echo
 * 
 * This script helps add friends as collaborators to an existing echo.
 * Run this in your development environment to update echo data.
 */

import { dummyFriends } from "../data/dummyFriends";
import { EchoStorage } from "../lib/echoStorage";

export async function addCollaboratorsToRegus() {
  // Initialize storage
  await EchoStorage.initialize();
  
  // Find the "Regus" echo
  const allEchoes = EchoStorage.getAll();
  const regusEcho = allEchoes.find(echo => echo.title.toLowerCase().includes("regus"));
  
  if (!regusEcho) {
    console.log("❌ Echo 'Regus' not found. Available echoes:");
    allEchoes.forEach(echo => console.log(`  - ${echo.title} (ID: ${echo.id})`));
    return;
  }
  
  console.log(`✅ Found echo: ${regusEcho.title}`);
  
  // Add first 3 friends as collaborators
  const collaboratorsToAdd = dummyFriends.slice(0, 3);
  
  for (const friend of collaboratorsToAdd) {
    try {
      await EchoStorage.addCollaborator(regusEcho.id, friend.id, friend.displayName);
      console.log(`✅ Added ${friend.displayName} as collaborator`);
    } catch (error) {
      console.error(`❌ Failed to add ${friend.displayName}:`, error);
    }
  }
  
  // Get updated echo
  const updatedEcho = EchoStorage.getById(regusEcho.id);
  console.log(`\n✅ Successfully updated echo "${updatedEcho?.title}"`);
  console.log(`   Collaborators: ${updatedEcho?.collaboratorIds?.length || 0}`);
  
  return updatedEcho;
}

// For direct execution (if needed)
export async function addCollaboratorsByEchoId(echoId: string, friendIds: string[]) {
  await EchoStorage.initialize();
  
  for (const friendId of friendIds) {
    const friend = dummyFriends.find(f => f.id === friendId);
    if (friend) {
      await EchoStorage.addCollaborator(echoId, friendId, friend.displayName);
      console.log(`✅ Added ${friend.displayName}`);
    }
  }
}

// Example usage:
// await addCollaboratorsToRegus();
// Or manually:
// await addCollaboratorsByEchoId("echo_123", ["friend_1", "friend_2", "friend_3"]);

