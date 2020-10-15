import React from 'react';
import styled from 'styled-components/macro';
import {
  isRenderNode,
  isEndNode,
  isContainer,
  getLastChild,
  calcTop,
  calcLeft,
  calcWidth,
  calcHeight,
  isSafeArea,
  SAFE_HEIGHT
} from './utils';

export const Layer = styled.div`
  box-sizing: content-box;
  position: absolute;
  /* border: 1px solid red; */
  background-color: ${p => (p.safe ? 'rgba(0, 255, 0, 0.2)' : 'none')};
  &:before {
    display: ${p => (p.safe ? 'none' : 'block')};
    box-sizing: border-box;
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: 1px solid red;
  }
`;

export default function renderLayer(
  tr,
  pre = [],
  parent = {
    isCont: false,
    top: 0,
    left: 0,
    diffTop: 0,
    diffLeft: 0
  },
  doc = {
    width: 0,
    height: 0
  }
) {
  return (
    <>
      {tr.children &&
        tr.children
          .slice()
          .reverse()
          .map((item, index) => {
            const path = pre.concat(item.name).join('/');
            const isCont = isContainer(item);

            if (!isRenderNode(item) || (parent.isCont && index === 0)) {
              return null;
            }

            if (isSafeArea(item)) {
              const top = (doc.height - SAFE_HEIGHT) / 2;
              const left = 0;

              return (
                <Layer
                  data-safe="true"
                  safe
                  data-name={`${path}_${index}`}
                  key={`${path}_${index}`}
                  style={{
                    top,
                    left,
                    width: doc.width,
                    height: SAFE_HEIGHT
                  }}
                >
                  {!isEndNode(item)
                    ? renderLayer(
                        item,
                        pre.concat(item.name),
                        {
                          isCont,
                          top,
                          left,
                          diffTop: 0,
                          diffLeft: 0
                        },
                        doc
                      )
                    : null}
                </Layer>
              );
            }

            const renderComp = isCont ? getLastChild(item) : item;

            const { top, left } = renderComp;
            const cTop = calcTop(renderComp, parent);
            const cLeft = calcLeft(renderComp, parent);
            const cWidth = calcWidth(renderComp, doc.width);
            const cHeight = calcHeight(renderComp, doc.height);

            return (
              <Layer
                data-cont={isCont ? `true|${renderComp.name}` : undefined}
                data-name={`${path}_${index}`}
                key={`${path}_${index}`}
                style={{
                  top: cTop - parent.diffTop,
                  left: cLeft - parent.diffLeft,
                  width: cWidth,
                  height: cHeight
                }}
              >
                {!isEndNode(item)
                  ? renderLayer(
                      item,
                      pre.concat(item.name),
                      {
                        isCont,
                        top: top,
                        left: left,
                        diffTop: cTop - (top - parent.top),
                        diffLeft: cLeft - (left - parent.left)
                      },
                      doc
                    )
                  : null}
              </Layer>
            );
          })}
    </>
  );
}
