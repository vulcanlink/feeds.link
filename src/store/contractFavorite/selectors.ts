import { createSelector } from 'redux-orm'
import orm from '../orm'
import { ContractFavorite } from './types'
import { feedResolve } from '../feed/selectors'

const emptyArray = []

type contractFavoritesSelectorType = ((state: any) => [ContractFavorite]) |
    ((state: any, id: string) => ContractFavorite) |
    ((state: any, ids: [string]) => [ContractFavorite])

//@ts-ignore
export const contractFavoritesSelector: contractFavoritesSelectorType = createSelector(orm.ContractFavorite)
export const contractFavoritesByFilterSelector: (state: any, filter: any) => [ContractFavorite] = createSelector(
    orm,
    (_session_, filter) => filter,
    (session, filter) => {
        const contracts = session.ContractFavorite.filter(filter).toModelArray().map((item: ContractFavorite) => {
            const { ref } = item;
            return {
                ...ref,
                feed: item.feed ? feedResolve(item.feed) : null
            };
        });

        if (contracts.length == 0) return emptyArray;
        return contracts;
    }
);

