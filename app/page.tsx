import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import AuthButtonServer from "./components/auth-btn-server";
import { redirect } from "next/navigation";
import CreateTweetForm from "./components/tweet/create-tweet-form";
import Tweets from "./components/tweets-list";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = createServerComponentClient<Database>({ cookies });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  const { data } = await supabase
    .from("tweets")
    .select("*, author: profiles(*), likes(user_id)")
    .order("created_at", { ascending: false });

  const tweets =
    data?.map((tweet) => ({
      ...tweet,
      author: Array.isArray(tweet.author) ? tweet.author[0] : tweet.author,
      user_has_liked_tweet: !!tweet.likes.find(
        (like) => like.user_id === session.user.id
      ),
      likes: tweet.likes.length,
    })) ?? [];
  return (
    <div className=" w-full max-w-xl mx-auto">
      <div className="flex justify-between px-4 py-6 border border-gray-800 border-t-0">
        <h1 className="text-xl font-bold">Home</h1>
        <AuthButtonServer />
      </div>
      <CreateTweetForm user={session.user} />
      <Tweets tweets={tweets} user={session.user} />
    </div>
  );
}
