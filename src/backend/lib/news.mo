import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Types "../types/news";

module {
  public func listNews(news : Map.Map<Types.NewsId, Types.NewsItem>) : [Types.NewsItem] {
    let all = news.values().toArray();
    all.sort(func (a, b) = if (a.publishedAt > b.publishedAt) { #less } else if (a.publishedAt < b.publishedAt) { #greater } else { #equal });
  };

  public func getNews(news : Map.Map<Types.NewsId, Types.NewsItem>, id : Types.NewsId) : ?Types.NewsItem {
    news.get(id);
  };

  public func createNews(
    news : Map.Map<Types.NewsId, Types.NewsItem>,
    state : { var nextNewsId : Nat },
    caller : Principal,
    title : Text,
    body : Text,
  ) : Types.NewsItem {
    let id = state.nextNewsId;
    state.nextNewsId := id + 1;
    let item : Types.NewsItem = {
      id;
      title;
      body;
      publishedAt = Time.now();
      author = caller;
    };
    news.add(id, item);
    item;
  };

  public func updateNews(
    news : Map.Map<Types.NewsId, Types.NewsItem>,
    caller : Principal,
    id : Types.NewsId,
    title : Text,
    body : Text,
  ) : ?Types.NewsItem {
    switch (news.get(id)) {
      case (?existing) {
        if (not Principal.equal(existing.author, caller)) {
          null;
        } else {
          let updated : Types.NewsItem = {
            id = existing.id;
            title;
            body;
            publishedAt = existing.publishedAt;
            author = existing.author;
          };
          news.add(id, updated);
          ?updated;
        };
      };
      case null { null };
    };
  };

  public func deleteNews(
    news : Map.Map<Types.NewsId, Types.NewsItem>,
    caller : Principal,
    id : Types.NewsId,
  ) : Bool {
    switch (news.get(id)) {
      case (?existing) {
        if (not Principal.equal(existing.author, caller)) {
          false;
        } else {
          news.remove(id);
          true;
        };
      };
      case null { false };
    };
  };
};
