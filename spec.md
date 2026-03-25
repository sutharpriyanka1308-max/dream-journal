# Dream Journal

## Current State
- Profile screen shows username, bio, energy stats, manifest input, tabs for My Dreams / My Attainments
- ManifestCard shows blessing input/send but does NOT display the list of existing blessings
- AttainmentScreen has inline Say 💬 input but does NOT display sent comments as a list
- No profile editing UI exists; profile saves only happen implicitly
- Backend has: Manifest with blessings[], Profile with avatar, saveCallerUserProfile
- Backend does NOT have: SayComments on manifests

## Requested Changes (Diff)

### Add
- Edit Profile modal/sheet in ProfileScreen: fields for username, bio, profile photo (via blob upload); saves via saveCallerUserProfile; shows "Profile updated ✨" on success; validates username not empty
- Blessed 💫 display section in ManifestCard: shows list of blessings (sender principal abbreviated as username, blessing text, time if available); scrollable; updates live when blessing sent
- Said 💬 display section in AttainmentScreen attainment cards: shows list of Say comments (username, text); scrollable; updates live when Say sent
- SayComment type and addSayComment / getSayComments functions to backend
- sayComments field on Manifest type in backend

### Modify
- ManifestCard: after send blessing, append to local blessings list immediately
- AttainmentScreen: after say send, append to local sayComments list immediately; send actually stores the comment
- ProfileScreen: add Edit Profile button in header area

### Remove
- Nothing removed

## Implementation Plan
1. Regenerate backend to add SayComment type, sayComments field on Manifest, addSayComment(manifestId, text) and getSayComments(manifestId) functions
2. Update useQueries.ts to add useAddSayComment hook
3. Update ManifestCard to show Blessed 💫 section (list of blessings from manifest.blessings + local optimistic), live update on send
4. Update AttainmentScreen to show Said 💬 section per card with local state list, live update on say send, wire to backend
5. Add EditProfileModal/Sheet to ProfileScreen with username, bio, photo upload, validation, success message
6. Ensure profile photo upload uses StorageClient/ExternalBlob pattern
