import { useQuery } from "@tanstack/react-query";
import { wallet_bonuses } from "@/api-manage/ApiRoutes.js";
import MainApi from "@/api-manage/MainApi";
const getWalletBonus = async () => {
	const { data } = await MainApi.get(wallet_bonuses);
	return data;
};

export default function useWalletBonus() {
	return useQuery("wallet_bonus", getWalletBonus, {
		enabled: false,
	});
}
