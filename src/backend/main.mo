import Set "mo:core/Set";
import Map "mo:core/Map";
import List "mo:core/List";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Initialize the access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User profile type and storage
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // User profile management functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Goal module and types
  module Goal {
    public type Priority = {
      #low;
      #medium;
      #high;
    };

    public func compare(goal1 : Goal, goal2 : Goal) : Order.Order {
      Text.compare(goal1.title, goal2.title);
    };
  };

  let goals = Map.empty<Principal, List.List<Goal>>();

  module StudySession {
    public func compare(session1 : StudySession, session2 : StudySession) : Order.Order {
      Text.compare(session1.subject, session2.subject);
    };
  };

  let studySessions = Map.empty<Principal, List.List<StudySession>>();

  module Resource {
    public func compare(resource1 : Resource, resource2 : Resource) : Order.Order {
      Text.compare(resource1.title, resource2.title);
    };
  };

  let resources = Map.empty<Principal, List.List<Resource>>();

  public type Goal = {
    title : Text;
    description : Text;
    targetDate : Text;
    category : Text;
    priority : Goal.Priority;
    completed : Bool;
  };

  public type StudySession = {
    subject : Text;
    durationMinutes : Nat;
    date : Text;
    notes : ?Text;
  };

  public type Resource = {
    title : Text;
    url : Text;
    category : Text;
    notes : ?Text;
  };

  public type ProgressStats = {
    totalGoals : Nat;
    completedGoals : Nat;
    totalStudyMinutes : Nat;
    distinctStudyDays : Nat;
    currentStreak : Nat;
  };

  // Goal management functions
  public shared ({ caller }) func createGoal(goal : Goal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create goals");
    };
    if (goal.title.size() == 0) { Runtime.trap("Goal title cannot be empty") };
    let userGoals = switch (goals.get(caller)) {
      case (null) { List.empty<Goal>() };
      case (?existing) { existing };
    };
    userGoals.add(goal);
    goals.add(caller, userGoals);
  };

  public shared ({ caller }) func updateGoal(title : Text, updatedGoal : Goal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update goals");
    };
    if (updatedGoal.title.size() == 0) { Runtime.trap("Goal title cannot be empty") };
    switch (goals.get(caller)) {
      case (null) { Runtime.trap("No goals found for this user") };
      case (?userGoals) {
        let updatedGoals = userGoals.map<Goal, Goal>(
          func(goal) {
            if (goal.title == title) { updatedGoal } else { goal };
          }
        );
        goals.add(caller, updatedGoals);
      };
    };
  };

  public shared ({ caller }) func deleteGoal(title : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete goals");
    };
    switch (goals.get(caller)) {
      case (null) { Runtime.trap("No goals to delete for this user") };
      case (?userGoals) {
        let filteredGoals = userGoals.filter(
          func(goal) {
            goal.title != title;
          }
        );
        goals.add(caller, filteredGoals);
      };
    };
  };

  public shared ({ caller }) func markGoalComplete(title : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark goals complete");
    };
    switch (goals.get(caller)) {
      case (null) { Runtime.trap("No goals found for this user") };
      case (?userGoals) {
        let updatedGoals = userGoals.map<Goal, Goal>(
          func(goal) {
            if (goal.title == title) {
              {
                goal with
                completed = true;
              };
            } else { goal };
          }
        );
        goals.add(caller, updatedGoals);
      };
    };
  };

  public query ({ caller }) func getGoals() : async [Goal] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view goals");
    };
    switch (goals.get(caller)) {
      case (null) { [] };
      case (?userGoals) { userGoals.toArray().sort() };
    };
  };

  // Study session management functions
  public shared ({ caller }) func addStudySession(session : StudySession) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add study sessions");
    };
    if (session.subject.size() == 0) { Runtime.trap("Study session subject cannot be empty") };
    let userSessions = switch (studySessions.get(caller)) {
      case (null) { List.empty<StudySession>() };
      case (?existing) { existing };
    };
    userSessions.add(session);
    studySessions.add(caller, userSessions);
  };

  public shared ({ caller }) func deleteStudySession(subject : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete study sessions");
    };
    switch (studySessions.get(caller)) {
      case (null) { Runtime.trap("No study sessions to delete for this user") };
      case (?userSessions) {
        let filteredSessions = userSessions.filter(
          func(session) {
            session.subject != subject;
          }
        );
        studySessions.add(caller, filteredSessions);
      };
    };
  };

  public query ({ caller }) func getStudySessions() : async [StudySession] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view study sessions");
    };
    switch (studySessions.get(caller)) {
      case (null) { [] };
      case (?userSessions) { userSessions.toArray().sort() };
    };
  };

  // Resource management functions
  public shared ({ caller }) func addResource(resource : Resource) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add resources");
    };
    let userResources = switch (resources.get(caller)) {
      case (null) { List.empty<Resource>() };
      case (?existing) { existing };
    };
    userResources.add(resource);
    resources.add(caller, userResources);
  };

  public shared ({ caller }) func updateResource(title : Text, updatedResource : Resource) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update resources");
    };
    switch (resources.get(caller)) {
      case (null) { Runtime.trap("No resources found for this user") };
      case (?userResources) {
        let updatedResources = userResources.map<Resource, Resource>(
          func(resource) {
            if (resource.title == title) { updatedResource } else { resource };
          }
        );
        resources.add(caller, updatedResources);
      };
    };
  };

  public shared ({ caller }) func deleteResource(title : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete resources");
    };
    switch (resources.get(caller)) {
      case (null) { Runtime.trap("No resources to delete for this user") };
      case (?userResources) {
        let filteredResources = userResources.filter(
          func(resource) {
            resource.title != title;
          }
        );
        resources.add(caller, filteredResources);
      };
    };
  };

  public query ({ caller }) func getResources() : async [Resource] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view resources");
    };
    switch (resources.get(caller)) {
      case (null) { [] };
      case (?userResources) { userResources.toArray().sort() };
    };
  };

  // Progress stats function
  public query ({ caller }) func getProgressStats() : async ProgressStats {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view progress stats");
    };

    let userGoals = switch (goals.get(caller)) {
      case (null) { List.empty<Goal>() };
      case (?goals) { goals };
    };

    let userSessions = switch (studySessions.get(caller)) {
      case (null) { List.empty<StudySession>() };
      case (?sessions) { sessions };
    };

    let totalGoals = userGoals.size();
    let completedGoals = userGoals.filter(func(g) { g.completed }).size();
    let totalStudyMinutes = userSessions.foldLeft(
      0,
      func(acc, session) {
        acc + session.durationMinutes;
      },
    );

    let distinctDays = userSessions.foldLeft(
      Set.empty<Text>(),
      func(acc, session) {
        acc.add(session.date);
        acc;
      },
    );

    let currentStreak = calculateCurrentStreak(userSessions);

    {
      totalGoals;
      completedGoals;
      totalStudyMinutes;
      distinctStudyDays = distinctDays.size();
      currentStreak;
    };
  };

  func calculateCurrentStreak(userSessions : List.List<StudySession>) : Nat {
    let today = Time.now();
    let dayInNanos = 24 * 60 * 60 * 1_000_000_000;
    let studyDates = List.empty<Text>();

    userSessions.values().forEach(
      func(session) {
        if (not studyDates.values().any(func(date) { date == session.date })) {
          studyDates.add(session.date);
        };
      }
    );

    var streak : Nat = 0;

    // This simulates checking consecutive days.
    for (i in studyDates.values()) {
      streak += 1;
    };

    streak;
  };
};
