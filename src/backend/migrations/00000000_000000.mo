import List "mo:core/List";
import Map "mo:core/Map";
import AccessControl "mo:caffeineai-authorization/access-control";

module {
  type NewsItem = {
    id : Nat;
    title : Text;
    body : Text;
    publishedAt : Int;
    author : Principal;
  };

  type Weekday = {
    #monday;
    #tuesday;
    #wednesday;
    #thursday;
    #friday;
    #saturday;
    #sunday;
  };

  type ProgramSlot = {
    weekday : Weekday;
    startTime : Text;
    endTime : Text;
    name : Text;
    description : Text;
  };

  public type OldActor = {};
  public type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    news : Map.Map<Nat, NewsItem>;
    newsState : { var nextNewsId : Nat };
    schedule : List.List<ProgramSlot>;
  };

  public func migration(_ : OldActor) : NewActor {
    {
      accessControlState = AccessControl.initState();
      news = Map.empty();
      newsState = { var nextNewsId = 0 };
      schedule = List.empty();
    };
  };
};
