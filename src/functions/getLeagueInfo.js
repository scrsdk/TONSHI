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
                name: "Серебрянная лига",
            }
        case "copper":
            return {
                icon: LeaguesCopperIcon,
                name: "Медная лига",
            }
        case "platinum":
            return {
                icon: LeaguesPlatinumIcon,
                name: "Платиновая лига",
            }
        case "gold":
            return {
                icon: LeaguesGoldIcon,
                name: "Золотая лига",
            }
        case "master":
            return {
                icon: LeaguesMasterIcon,
                name: "Грандмастер",
            }
        default:
            return default_league;
    }
}