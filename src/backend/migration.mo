import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Blob "blob-storage/Storage";
import Array "mo:core/Array";
import Time "mo:core/Time";
import List "mo:core/List";

module {
  type Energy = Nat;

  type OldProfile = {
    username : Text;
    bio : Text;
    avatar : ?Blob.ExternalBlob;
    totalBoosts : Nat;
    totalBlessings : Nat;
    gratitudeStars : Nat;
    gratitudeHearts : Nat;
    gratitudeAngles : Nat;
    desire : Energy;
    mystery : Energy;
    gratitude : Energy;
    wish : Energy;
    manifestPower : Energy;
  };

  type OldBlessing = {
    blessing : Text;
    sender : Principal.Principal;
  };

  type OldEnergyReaction = {
    #star;
    #heart;
    #angelBadge;
  };

  type OldReaction = {
    type_ : OldEnergyReaction;
    sender : Principal.Principal;
  };

  type OldManifestId = Nat;

  type OldManifestTitle = Text;
  type OldBlessingMessage = Text;

  type OldManifest = {
    title : Text;
    description : Text;
    isAttained : Bool;
    boostCount : Nat;
    blessings : [OldBlessing];
    reactions : [OldReaction];
    ownerId : Principal.Principal;
  };

  type OldExperienceId = Nat;

  type OldCaption = Text;

  type OldExperience = {
    id : OldExperienceId;
    media : [Blob.ExternalBlob];
    caption : OldCaption;
    user : Principal.Principal;
  };

  type OldActor = {
    profiles : Map.Map<Principal.Principal, OldProfile>;
    nextManifestId : Nat;
    nextExperienceId : Nat;
    nextProfileId : Nat;
    nextBlessingId : Nat;
    nextReactionId : Nat;
    nextEnergy : Nat;
    manifestDB : Map.Map<OldManifestId, OldManifest>;
    userManifests : Map.Map<Principal.Principal, List.List<OldManifestId>>;
    experiences : Map.Map<OldExperienceId, OldExperience>;
  };

  type SayComment = {
    text : Text;
    sender : Principal.Principal;
  };

  type NewManifestId = Nat;

  type NewManifestTitle = Text;
  type NewBlessingMessage = Text;

  type NewManifest = {
    title : Text;
    description : Text;
    isAttained : Bool;
    boostCount : Nat;
    blessings : [OldBlessing];
    reactions : [OldReaction];
    sayComments : [SayComment];
    ownerId : Principal.Principal;
  };

  type NewActor = {
    profiles : Map.Map<Principal.Principal, OldProfile>;
    nextManifestId : Nat;
    nextExperienceId : Nat;
    nextProfileId : Nat;
    nextBlessingId : Nat;
    nextReactionId : Nat;
    nextEnergy : Nat;
    nextSayCommentId : Nat;
    manifestDB : Map.Map<NewManifestId, NewManifest>;
    userManifests : Map.Map<Principal.Principal, List.List<NewManifestId>>;
    experiences : Map.Map<OldExperienceId, OldExperience>;
  };

  public func run(old : OldActor) : NewActor {
    let newManifests = old.manifestDB.map<OldManifestId, OldManifest, NewManifest>(
      func(_id, oldManifest) {
        {
          oldManifest with
          sayComments = Array.empty<SayComment>();
        };
      }
    );

    let newActorState : NewActor = {
      old with
      manifestDB = newManifests;
      nextSayCommentId = 0;
    };
    newActorState;
  };
};

