import React from 'react'
import _ from 'lodash'
import { createRoot } from 'react-dom/client'
import { createPortal } from 'react-dom'
import { UserType } from './interface'
import { weiboExtendVirtualRootId } from './constants'

interface IShowUserListRProps {
    userList: UserType[]
}
// @ts-ignore
export const ShowUserListR: React.FC<IShowUserListRProps> = ({ userList }) => {
    if (_.isEmpty(userList)) return
    const handleUserClick = (userInfo: UserType) => {
        const { uid, avatar, title } = userInfo || {}
        const url = /\d+/.test(uid) ? '//weibo.com/u/' + uid : '//weibo.com/' + uid
        window.open(url, '_blank')
    }

    return (
        <div>
            {_.map(userList, userInfo => {
                const { uid, avatar, title } = userInfo || {}

                return (
                    <div
                        onClick={() => {
                            handleUserClick(userInfo)
                        }}
                    >
                        <img src={avatar} alt={title} />
                        <span>{title}</span>
                    </div>
                )
            })}
        </div>
    )
}

export const XShowUserListR = ({ userList }: IShowUserListRProps) => {
    if (!userList) {
        return
    }
    const virtualRoot = document.getElementById(weiboExtendVirtualRootId) as HTMLElement
    const root = createRoot(virtualRoot)
    root.render(
        <div>
            <ShowUserListR userList={userList} />
        </div>
    )

    // createPortal(<ShowUserListR userList={userList} />, virtualRoot)

    // return result;
}
