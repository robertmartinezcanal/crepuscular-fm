import List "mo:core/List";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import Expose "mo:caffeineai-oql/Expose";
import Entity "mo:caffeineai-oql/Entity";
import MapEntity "mo:caffeineai-oql/MapEntity";
import RecordValue "mo:caffeineai-oql/RecordValue";
import NatValue "mo:caffeineai-oql/NatValue";
import TextValue "mo:caffeineai-oql/TextValue";
import IntValue "mo:caffeineai-oql/IntValue";
import PrincipalValue "mo:caffeineai-oql/PrincipalValue";
import NewsTypes "types/news";
import ScheduleTypes "types/schedule";
import NewsApiMixin "mixins/news-api";
import ScheduleApiMixin "mixins/schedule-api";
import ApiDocMixin "mixins/api-doc";

actor {
  let accessControlState : AccessControl.AccessControlState;
  include MixinAuthorization(accessControlState, null);

  let news : Map.Map<NewsTypes.NewsId, NewsTypes.NewsItem>;
  let newsState : { var nextNewsId : Nat };
  let schedule : List.List<ScheduleTypes.ProgramSlot>;

  include NewsApiMixin(accessControlState, news, newsState);
  include ScheduleApiMixin(schedule);

  include Expose({
    entities = [
      news.toEntity("news", "NewsItem", "id")
        .sample({
          id = 0;
          title = "";
          body = "";
          publishedAt = 0;
          author = Principal.fromText("aaaaa-aa");
        })
        .public_()
        .build(),
    ];
  });

  include ApiDocMixin();
};
