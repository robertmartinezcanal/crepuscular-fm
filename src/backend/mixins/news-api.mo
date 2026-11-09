import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Result "mo:core/Result";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import NewsLib "../lib/news";
import Types "../types/news";

mixin (
  accessControlState : AccessControl.AccessControlState,
  news : Map.Map<Types.NewsId, Types.NewsItem>,
  state : { var nextNewsId : Nat },
) {
  public type NewsError = {
    #notFound : Types.NewsId;
    #notAuthor : Types.NewsId;
  };

  public query func listNews() : async [Types.NewsItem] {
    NewsLib.listNews(news);
  };

  public query func getNews(id : Types.NewsId) : async ?Types.NewsItem {
    NewsLib.getNews(news, id);
  };

  public shared ({ caller }) func createNews(title : Text, body : Text) : async Types.NewsItem {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only signed-in staff can publish news");
    };
    NewsLib.createNews(news, state, caller, title, body);
  };

  public shared ({ caller }) func updateNews(id : Types.NewsId, title : Text, body : Text) : async Result.Result<Types.NewsItem, NewsError> {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only signed-in staff can edit news");
    };
    switch (news.get(id)) {
      case null { #err(#notFound(id)) };
      case (?existing) {
        if (not Principal.equal(existing.author, caller)) {
          #err(#notAuthor(id));
        } else {
          switch (NewsLib.updateNews(news, caller, id, title, body)) {
            case (?updated) { #ok(updated) };
            case null { #err(#notFound(id)) };
          };
        };
      };
    };
  };

  public shared ({ caller }) func deleteNews(id : Types.NewsId) : async Result.Result<(), NewsError> {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only signed-in staff can delete news");
    };
    switch (news.get(id)) {
      case null { #err(#notFound(id)) };
      case (?existing) {
        if (not Principal.equal(existing.author, caller)) {
          #err(#notAuthor(id));
        } else {
          ignore NewsLib.deleteNews(news, caller, id);
          #ok(());
        };
      };
    };
  };
};
