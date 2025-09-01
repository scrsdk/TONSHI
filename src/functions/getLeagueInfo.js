import LeaguesBronzeIcon from "~/assets/images/leagues/bronze.png";
import LeaguesCopperIcon from "~/assets/images/leagues/copper.png";
import LeaguesGoldIcon from "~/assets/images/leagues/gold.png";
import LeaguesMasterIcon from "~/assets/images/leagues/master.png";
import LeaguesPlatinumIcon from "~/assets/images/leagues/platinum.png";
import LeaguesSilverIcon from "~/assets/images/leagues/silver.png";

export default (type) => {
    const default_league = {
        icon: LeaguesBronzeIcon,
        name: "Bronze League",
    };
    switch (type) {
        case "bronze":
            return default_league;
        case "silver":
            return {
                icon: LeaguesSilverIcon,
                name: "Silver League",
            }
        case "copper":
            return {
                icon: LeaguesCopperIcon,
                name: "Copper League",
            }
        case "platinum":
            return {
                icon: LeaguesPlatinumIcon,
                name: "Platinum League",
            }
        case "gold":
            return {
                icon: LeaguesGoldIcon,
                name: "Gold League",
            }
        case "master":
            return {
                icon: LeaguesMasterIcon,
                name: "Master League",
            }
        default:
            return default_league;
    }
}