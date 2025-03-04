/**
 * SPDX-FileCopyrightText: © 2019 Liferay, Inc. <https://liferay.com>
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {ClayPortal, IPortalBaseProps} from '@clayui/shared';
import {hideOthers} from 'aria-hidden';
import classNames from 'classnames';
import React, {useEffect, useMemo, useRef} from 'react';
import warning from 'warning';

import Body from './Body';
import Context, {IContext} from './Context';
import Footer from './Footer';
import Header, {
	Item,
	ItemGroup,
	Subtitle,
	SubtitleSection,
	Title,
	TitleIndicator,
	TitleSection,
} from './Header';
import {useUserInteractions} from './Hook';
import {Observer, ObserverType, Size} from './types';

interface IProps
	extends React.HTMLAttributes<HTMLDivElement>,
		Omit<IContext, 'onClose' | 'ariaLabelledby'> {
	/**
	 * Flag indicating to vertically center the modal.
	 */
	center?: boolean;

	/**
	 * Container element to render modal into.
	 */
	containerElementRef?: React.RefObject<Element>;

	/**
	 * Props to add to the <ClayPortal/>.
	 */
	containerProps?: IPortalBaseProps;

	/**
	 * A flag indicating if the modal shouldn't
	 * be closed when either the ESC key is pressed
	 * or when clicking outside the modal
	 */
	disableAutoClose?: boolean;

	/**
	 * The size of element modal.
	 */
	size?: Size;

	/**
	 * Observer is Modal's communication system with `useModal`
	 * hook, adds observer from `useModal` hook here.
	 */
	observer: Observer;

	/**
	 * Allows setting a custom z-index value, overriding the default one which is 1040, modal body z-index will be +10 of this value
	 */
	zIndex?: number;
}

const warningMessage = `You need to pass the 'observer' prop to ClayModal for everything to work fine, use the 'useModal' hook that exposes the observer.

> const {observer} = useModal({...});
>
> return (
> 	<ClayModal observer={observer}>
> 		...
> 	</ClayModal>
> ); 
`;

let counter = 0;

const ClayModal = ({
	center,
	children,
	className,
	containerElementRef,
	containerProps = {},
	disableAutoClose = false,
	observer,
	size,
	spritemap,
	status,
	zIndex,
	...otherProps
}: IProps) => {
	const modalElementRef = useRef<HTMLDivElement | null>(null);
	const modalBodyElementRef = useRef<HTMLDivElement | null>(null);

	warning(observer !== undefined, warningMessage);

	useUserInteractions(
		modalElementRef,
		modalBodyElementRef,
		() => !disableAutoClose && observer.dispatch(ObserverType.Close)
	);

	useEffect(() => observer.dispatch(ObserverType.Open), []);

	useEffect(() => {
		if (modalBodyElementRef.current) {
			modalBodyElementRef.current.focus();
		}
	}, [modalBodyElementRef]);

	const ariaLabelledby = useMemo(() => {
		counter++;

		return `clay-modal-label-${counter}`;
	}, []);

	const [show, content] =
		observer && observer.mutation ? observer.mutation : [false, false];

	useEffect(() => {
		if (modalElementRef.current && show) {
			// Hide everything from ARIA except the Modal Body
			return hideOthers(modalElementRef.current);
		}
	}, [show]);

	return (
		<ClayPortal
			{...containerProps}
			containerRef={containerElementRef}
			subPortalRef={modalElementRef}
		>
			<div
				aria-hidden="true"
				className={classNames('modal-backdrop fade', {
					show,
				})}
				style={{zIndex}}
			/>
			<div
				{...otherProps}
				className={classNames('fade modal d-block', className, {
					show,
				})}
				ref={modalElementRef}
				style={{zIndex: zIndex && zIndex + 10}}
			>
				<div
					aria-labelledby={ariaLabelledby}
					className={classNames('modal-dialog', {
						[`modal-${size}`]: size,
						[`modal-${status}`]: status,
						'modal-dialog-centered': center,
					})}
					ref={modalBodyElementRef}
					role="dialog"
					tabIndex={-1}
				>
					<div className="modal-content">
						<Context.Provider
							value={{
								ariaLabelledby,
								onClose: () =>
									observer.dispatch(ObserverType.Close),
								spritemap,
								status,
							}}
						>
							{content && children}
						</Context.Provider>
					</div>
				</div>
			</div>
		</ClayPortal>
	);
};

export default Object.assign(ClayModal, {
	Body,
	Footer,
	Header,
	Item,
	ItemGroup,
	Subtitle,
	SubtitleSection,
	Title,
	TitleIndicator,
	TitleSection,
});
