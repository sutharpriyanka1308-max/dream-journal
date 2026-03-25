import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import List "mo:core/List";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Blob "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import Migration "migration";

(with migration = Migration.run)
actor {
  include MixinStorage();

  module Energy {
    public type Energy = Nat;
  };

  module Profile {
    public type Profile = {
      username : Text;
      bio : Text;
      avatar : ?Blob.ExternalBlob;
      totalBoosts : Nat;
      totalBlessings : Nat;
      gratitudeStars : Nat;
      gratitudeHearts : Nat;
      gratitudeAngles : Nat;
      desire : Energy.Energy;
      mystery : Energy.Energy;
      gratitude : Energy.Energy;
      wish : Energy.Energy;
      manifestPower : Energy.Energy;
    };

    func natCompare(n1 : Nat, n2 : Nat) : Order.Order {
      if (n1 < n2) { #less } else if (n1 > n2) { #greater } else {
        #equal;
      };
    };

    public func compare(p1 : Profile, p2 : Profile) : Order.Order {
      natCompare(p1.manifestPower, p2.manifestPower);
    };
  };

  module SayComment {
    public type SayComment = {
      text : Text;
      sender : Principal;
    };
  };

  module ManifestId {
    public type ManifestId = Nat;
  };

  module ManifestTitle {
    public type ManifestTitle = Text;
  };

  module BlessingMessage {
    public type BlessingMessage = Text;
  };

  module Blessing {
    public type Blessing = {
      blessing : BlessingMessage.BlessingMessage;
      sender : Principal;
    };
  };

  module EnergyReaction {
    public type EnergyReaction = {
      #star;
      #heart;
      #angelBadge;
    };
  };

  module Reaction {
    public type Reaction = {
      type_ : EnergyReaction.EnergyReaction;
      sender : Principal;
    };
  };

  module Manifest {
    public type Manifest = {
      title : Text;
      description : Text;
      isAttained : Bool;
      boostCount : Nat;
      blessings : [Blessing.Blessing];
      reactions : [Reaction.Reaction];
      sayComments : [SayComment.SayComment];
      ownerId : Principal;
    };
  };

  module Timestamp {
    public type Timestamp = Time.Time;
  };

  module ExperienceId {
    public type ExperienceId = Nat;
  };

  module Caption {
    public type Caption = Text;
  };

  module Experience {
    public type Experience = {
      id : ExperienceId.ExperienceId;
      media : [Blob.ExternalBlob];
      caption : Caption.Caption;
      user : Principal;
    };
  };

  type Blob = Blob.ExternalBlob;
  type Manifest = Manifest.Manifest;
  type ManifestTitle = ManifestTitle.ManifestTitle;
  type ManifestId = ManifestId.ManifestId;
  type Blessing = Blessing.Blessing;
  type EnergyReaction = EnergyReaction.EnergyReaction;
  type Reaction = Reaction.Reaction;
  type SayComment = SayComment.SayComment;
  type ExperienceId = ExperienceId.ExperienceId;
  type Experience = Experience.Experience;
  type Caption = Caption.Caption;
  type Profile = Profile.Profile;

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let profiles = Map.empty<Principal, Profile>();
  var nextManifestId = 0;
  var nextExperienceId = 0;
  var nextProfileId = 0;
  var nextBlessingId = 0;
  var nextReactionId = 0;
  var nextEnergy = 0;
  var nextSayCommentId = 0;
  let manifestDB = Map.empty<ManifestId, Manifest>();
  let userManifests = Map.empty<Principal, List.List<ManifestId>>();
  let experiences = Map.empty<ExperienceId, Experience>();

  public query ({ caller }) func getExperience(id : ExperienceId) : async ?Experience {
    experiences.get(id);
  };

  public query ({ caller }) func getManifest(manifestId : ManifestId) : async ?Manifest {
    manifestDB.get(manifestId);
  };

  public query ({ caller }) func getManifestBlessingCount(manifestId : ManifestId) : async Nat {
    switch (manifestDB.get(manifestId)) {
      case (null) { 0 };
      case (?manifest) { manifest.blessings.size() };
    };
  };

  public shared ({ caller }) func addExperience(media : [Blob], caption : Caption) : async ExperienceId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add experiences");
    };
    let id = nextExperienceId;
    nextExperienceId += 1;
    let experience : Experience = {
      id;
      media;
      caption;
      user = caller;
    };
    experiences.add(id, experience);
    id;
  };

  public shared ({ caller }) func createManifest(title : Text, description : Text) : async ManifestId {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create manifests");
    };
    let manifestId = nextManifestId;
    nextManifestId += 1;

    let manifest : Manifest = {
      title;
      description;
      isAttained = false;
      boostCount = 0;
      blessings = [];
      reactions = [];
      sayComments = [];
      ownerId = caller;
    };

    manifestDB.add(manifestId, manifest);

    let existingManifests = switch (userManifests.get(caller)) {
      case (?existing) { existing };
      case (null) { List.empty<ManifestId>() };
    };
    existingManifests.add(manifestId);
    userManifests.add(caller, existingManifests);

    manifestId;
  };

  public query ({ caller }) func getUserBlessings(user : Principal) : async [Blessing] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own blessings");
    };
    let blessingList = List.empty<Blessing>();
    let userManifestsList = switch (userManifests.get(user)) {
      case (null) { List.empty<ManifestId>() };
      case (?manifests) { manifests };
    };
    for (manifestId in userManifestsList.values()) {
      switch (manifestDB.get(manifestId)) {
        case (null) {};
        case (?manifest) {
          let blessingListArray = blessingList.toArray();
          blessingList.clear();
          blessingList.addAll(blessingListArray.values());
          blessingList.addAll(manifest.blessings.values());
        };
      };
    };
    blessingList.toArray();
  };

  public shared ({ caller }) func sendBlessing(manifestId : ManifestId, blessing : BlessingMessage.BlessingMessage) : async Blessing {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send blessings");
    };
    let blessingObj : Blessing = {
      blessing;
      sender = caller;
    };
    switch (manifestDB.get(manifestId)) {
      case (null) { Runtime.trap("Manifest not found!") };
      case (?manifest) {
        let newBlessings = [manifest.blessings, [blessingObj]].flatten();
        let updatedManifest : Manifest = {
          manifest with
          blessings = newBlessings;
        };
        manifestDB.add(manifestId, updatedManifest);

        switch (profiles.get(manifest.ownerId)) {
          case (?profile) {
            let updatedProfile : Profile = {
              profile with
              totalBlessings = profile.totalBlessings + 1;
            };
            profiles.add(manifest.ownerId, updatedProfile);
          };
          case (null) {};
        };
      };
    };
    blessingObj;
  };

  public query ({ caller }) func getManifestByOwner(user : Principal) : async [Manifest] {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own manifests");
    };
    var ownerList = List.empty<ManifestId>();
    switch (userManifests.get(user)) {
      case (null) {};
      case (?existing) {
        ownerList := existing;
      };
    };
    var resultList = List.empty<Manifest>();
    if (ownerList.isEmpty()) {
      return resultList.toArray();
    };
    let outputArray = ownerList.toArray();
    ownerList.clear();
    ownerList.addAll(outputArray.values());
    for (manifestId in ownerList.values()) {
      switch (manifestDB.get(manifestId)) {
        case (?manifest) {
          resultList.add(manifest);
        };
        case (null) {};
      };
    };
    resultList.toArray();
  };

  public query ({ caller }) func getManifestsByTitle(substring : ManifestTitle) : async [Manifest] {
    let result = List.empty<Manifest>();
    for (manifest in manifestDB.values()) {
      if (manifest.title.contains(#text substring)) {
        result.add(manifest);
      };
    };
    result.toArray();
  };

  public shared ({ caller }) func boostUpManifest(manifestId : ManifestId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can boost manifests");
    };
    switch (manifestDB.get(manifestId)) {
      case (null) { Runtime.trap("Manifest does not exist!") };
      case (?manifest) {
        let updatedManifest : Manifest = {
          manifest with
          boostCount = manifest.boostCount + 1;
        };
        manifestDB.add(manifestId, updatedManifest);

        switch (profiles.get(manifest.ownerId)) {
          case (?profile) {
            let updatedProfile : Profile = {
              profile with
              totalBoosts = profile.totalBoosts + 1;
            };
            profiles.add(manifest.ownerId, updatedProfile);
          };
          case (null) {};
        };
      };
    };
  };

  public shared ({ caller }) func sendEnergyReaction(manifestId : ManifestId, reactionType : EnergyReaction) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send energy reactions");
    };
    let reaction = {
      type_ = reactionType;
      sender = caller;
    };
    switch (manifestDB.get(manifestId)) {
      case (null) { Runtime.trap("Manifest not found!") };
      case (?manifest) {
        let newReactions = [manifest.reactions, [reaction]].flatten();
        let updatedManifest : Manifest = {
          manifest with
          reactions = newReactions;
        };
        manifestDB.add(manifestId, updatedManifest);
      };
    };
  };

  public shared ({ caller }) func markManifestAttained(manifestId : ManifestId) : async () {
    switch (manifestDB.get(manifestId)) {
      case (null) { Runtime.trap("Manifest does not exist!") };
      case (?manifest) {
        if (manifest.ownerId != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the manifest owner or admin can mark it as attained");
        };
        let updatedManifest : Manifest = {
          manifest with
          isAttained = true;
        };
        manifestDB.add(manifestId, updatedManifest);
      };
    };
  };

  public query ({ caller }) func getAllManifests() : async [Manifest] {
    manifestDB.values().toArray();
  };

  public query ({ caller }) func getUserManifestsSnapshot(owner : Principal) : async [Manifest] {
    let userManifestIds = switch (userManifests.get(owner)) {
      case (null) { List.empty<ManifestId>() };
      case (?manifests) { manifests };
    };
    let manifestsList = List.empty<Manifest>();
    for (manifestId in userManifestIds.values()) {
      switch (manifestDB.get(manifestId)) {
        case (null) {};
        case (?mf) { manifestsList.add(mf) };
      };
    };
    manifestsList.toArray();
  };

  public shared ({ caller }) func addEnergyGratitude(profileId : Principal, energyType : EnergyReaction) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add energy gratitude");
    };
    if (caller != profileId) {
      Runtime.trap("Unauthorized: Can only add energy gratitude to your own profile");
    };
    switch (profiles.get(profileId)) {
      case (null) { Runtime.trap("Profile does not exist!") };
      case (?profile) {
        let updatedProfile : Profile = if (energyType == #heart) {
          { profile with gratitudeHearts = profile.gratitudeHearts + 1 };
        } else if (energyType == #star) {
          { profile with gratitudeStars = profile.gratitudeStars + 1 };
        } else {
          { profile with gratitudeAngles = profile.gratitudeAngles + 1 };
        };
        profiles.add(profileId, updatedProfile);
      };
    };
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : Profile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    profiles.add(caller, profile);
  };

  public shared ({ caller }) func saveProfile(profile : Profile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    profiles.add(caller, profile);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?Profile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    profiles.get(user);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?Profile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    profiles.get(caller);
  };

  public shared ({ caller }) func getProfile(user : Principal) : async ?Profile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    profiles.get(user);
  };

  public query ({ caller }) func getAllProfiles() : async [Profile] {
    profiles.values().toArray();
  };

  public shared ({ caller }) func deleteExperience(experienceId : ExperienceId) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete experiences");
    };
    experiences.remove(experienceId);
  };

  public shared ({ caller }) func deleteManifest(manifestId : ManifestId) : async () {
    switch (manifestDB.get(manifestId)) {
      case (null) { Runtime.trap("Manifest does not exist!") };
      case (?manifest) {
        if (manifest.ownerId == caller or AccessControl.isAdmin(accessControlState, caller)) {
          manifestDB.remove(manifestId);

          switch (userManifests.get(manifest.ownerId)) {
            case (?manifests) {
              let filteredList = List.empty<ManifestId>();
              for (id in manifests.values()) {
                if (id != manifestId) {
                  filteredList.add(id);
                };
              };
              userManifests.add(manifest.ownerId, filteredList);
            };
            case (null) {};
          };
        } else {
          Runtime.trap("Unauthorized: Cannot delete another user's manifest");
        };
      };
    };
  };

  public shared ({ caller }) func deleteProfile(user : Principal) : async () {
    if (AccessControl.hasPermission(accessControlState, caller, #admin)) {
      profiles.remove(user);
    } else if (caller == user) {
      profiles.remove(user);
    } else {
      Runtime.trap("Unauthorized: Cannot delete another user's profile");
    };
  };

  public query ({ caller }) func getTopUsers(limit : Nat) : async [Profile] {
    let profilesArray = profiles.values().toArray();
    let sorted = profilesArray.sort();
    let reversed = sorted.reverse();
    reversed.sliceToArray(0, limit);
  };

  public query ({ caller }) func getAdminManifests(admin : Principal) : async [Manifest] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all user manifests");
    };
    let manifestsList = List.empty<Manifest>();
    for (manifest in manifestDB.values()) {
      manifestsList.add(manifest);
    };
    manifestsList.toArray();
  };

  // New Say functionality

  type SayId = Nat;
  var nextSayId : SayId = 0;

  public shared ({ caller }) func addSayComment(manifestId : ManifestId, text : Text) : async SayComment {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add Say comments");
    };
    let sayId = nextSayId;
    nextSayId += 1;
    let say : SayComment = {
      text;
      sender = caller;
    };

    switch (manifestDB.get(manifestId)) {
      case (null) {
        Runtime.trap("Manifest does not exist!");
      };
      case (?manifest) {
        let updatedSayComments = Array.tabulate(
          manifest.sayComments.size() + 1,
          func(i) {
            if (i < manifest.sayComments.size()) {
              manifest.sayComments[i];
            } else {
              say;
            };
          },
        );
        let updatedManifest : Manifest = {
          manifest with
          sayComments = updatedSayComments;
        };
        manifestDB.add(manifestId, updatedManifest);
      };
    };
    say;
  };

  public query ({ caller }) func getManifestSayComments(manifestId : ManifestId) : async [SayComment] {
    switch (manifestDB.get(manifestId)) {
      case (null) { [] };
      case (?manifest) { manifest.sayComments };
    };
  };
};

